// Cloudflare Pages Functions - SPA 路由回退中间件
// 当请求的是前端路由（非静态资源）时，返回 index.html

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 静态资源直接放行
  if (
    path.startsWith('/assets/') ||
    path.startsWith('/favicon') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.svg') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.json') ||
    path.endsWith('.ico') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ttf')
  ) {
    return next();
  }

  // 其他请求回退到 index.html（SPA 路由）
  const indexRequest = new Request(`${url.origin}/index.html`, request);
  return fetch(indexRequest);
};
