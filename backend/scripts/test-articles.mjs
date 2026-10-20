
import 'dotenv/config';

const BASE_URL =
  process.env.TEST_API_URL ?? 'http://127.0.0.1:8000/api/v1';

const EMAIL = process.env.TEST_OWNER_EMAIL;
const PASSWORD = process.env.TEST_OWNER_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error(
    'Set TEST_OWNER_EMAIL and TEST_OWNER_PASSWORD before running tests.',
  );
  process.exit(1);
}

let cookie = '';
let articleId = '';
let passed = 0;
let failed = 0;

async function request(method, path, body, expectedStatus) {
  const headers = { 'Content-Type': 'application/json' };

  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const setCookies = response.headers.getSetCookie?.() ?? [];

  if (setCookies.length) {
    const newCookies = setCookies
      .map((value) => value.split(';')[0])
      .filter(Boolean);

    // Preserve existing cookies if the server only updates one.
    const jar = new Map(
      cookie
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const index = part.indexOf('=');
          return [part.slice(0, index), part.slice(index + 1)];
        }),
    );

    for (const value of newCookies) {
      const index = value.indexOf('=');
      jar.set(value.slice(0, index), value.slice(index + 1));
    }

    cookie = [...jar.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (response.status !== expectedStatus) {
    throw new Error(
      `${method} ${path}: expected ${expectedStatus}, got ${response.status}. ` +
      `${JSON.stringify(data)}`,
    );
  }

  return data;
}

async function test(name, action) {
  try {
    await action();
    passed++;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL  ${name}: ${error.message}`);
  }
}

function findArticle(value, predicate) {
  if (!value || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findArticle(item, predicate);
      if (found) return found;
    }
    return null;
  }

  if (predicate(value)) return value;

  for (const child of Object.values(value)) {
    const found = findArticle(child, predicate);
    if (found) return found;
  }

  return null;
}

async function main() {
  const unique = Date.now();
  const originalTitle = `Automated Test Article ${unique}`;
  const updatedTitle = `Updated Test Article ${unique}`;
  const originalSlug = originalTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const updatedSlug = updatedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  console.log(`\nTesting API: ${BASE_URL}\n`);

  try {
    await test('1. Owner login', async () => {
      await request(
        'POST',
        '/auth/login',
        { email: EMAIL, password: PASSWORD },
        200,
      );

      if (!cookie.includes('accessToken=')) {
        throw new Error(
          'Login returned 200 but no accessToken cookie was received. ' +
          'Check your backend cookie settings.',
        );
      }
    });

    await test('2. List public articles', async () => {
      await request('GET', '/articles', undefined, 200);
    });

    await test('3. Create draft', async () => {
      const data = await request(
        'POST',
        '/articles',
        {
          title: originalTitle,
          excerpt: 'Automated article API test.',
          content: 'This article is created by the automated test script.',
        },
        201,
      );

      const article = findArticle(
        data,
        (item) =>
          typeof item._id === 'string' &&
          item.title === originalTitle,
      );

      if (!article) {
        throw new Error('Created article was not found in the response.');
      }

      articleId = article._id;

      if (article.status !== 'draft') {
        throw new Error(`Expected draft status, got ${article.status}`);
      }
    });

    await test('4. List owner articles', async () => {
      const data = await request(
        'GET',
        '/articles/owner',
        undefined,
        200,
      );

      const found = findArticle(
        data,
        (item) => item._id === articleId,
      );

      if (!found) throw new Error('New draft not found in owner list.');
    });

    await test('5. Get owner article', async () => {
      await request(
        'GET',
        `/articles/owner/${articleId}`,
        undefined,
        200,
      );
    });

    await test('6. Update article', async () => {
      const data = await request(
        'PATCH',
        `/articles/${articleId}`,
        {
          title: updatedTitle,
          content: 'Updated content from the automated API test.',
        },
        200,
      );

      const article = findArticle(
        data,
        (item) =>
          item._id === articleId &&
          item.title === updatedTitle,
      );

      if (!article) {
        throw new Error('Updated title was not returned.');
      }

      if (article.slug !== updatedSlug) {
        throw new Error(`Expected slug ${updatedSlug}, got ${article.slug}`);
      }
    });

    await test('7. Draft is hidden from public detail', async () => {
      await request('GET', `/articles/${updatedSlug}`, undefined, 404);
    });

    await test('8. Publish article', async () => {
      await request(
        'PATCH',
        `/articles/${articleId}/publish`,
        undefined,
        200,
      );
    });

    await test('9. Read published article publicly', async () => {
      const data = await request(
        'GET',
        `/articles/${updatedSlug}`,
        undefined,
        200,
      );

      const article = findArticle(
        data,
        (item) => item._id === articleId,
      );

      if (!article) {
        throw new Error('Published article was not found in response.');
      }

      if (article.status !== 'published') {
        throw new Error('Public article does not have published status.');
      }
    });

    await test('10. Unpublish article', async () => {
      await request(
        'PATCH',
        `/articles/${articleId}/unpublish`,
        undefined,
        200,
      );
    });

    await test('11. Unpublished article is hidden publicly', async () => {
      await request('GET', `/articles/${updatedSlug}`, undefined, 404);
    });

    await test('12. Delete article', async () => {
      await request(
        'DELETE',
        `/articles/${articleId}`,
        undefined,
        200,
      );
    });

    await test('13. Deleted article is unavailable to owner', async () => {
      await request(
        'GET',
        `/articles/owner/${articleId}`,
        undefined,
        404,
      );
    });
  } finally {
    // Best-effort cleanup if a test failed before the delete test.
    if (articleId) {
      try {
        await request(
          'DELETE',
          `/articles/${articleId}`,
          undefined,
          200,
        );
        console.log('CLEANUP  Removed test article');
      } catch {
        // It may already have been deleted, or auth/server may have failed.
      }
    }

    console.log('\n========== TEST SUMMARY ==========');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('==================================\n');
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Test runner failed:', error);
  process.exitCode = 1;
});
