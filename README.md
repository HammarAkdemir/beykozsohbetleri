# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

## Render ile yayınlama

Bu repo, React/Vite istemcisi ile `server/app.py` Python API'sini aynı web servisinde çalıştırmak için `render.yaml` içerir.

1. Değişiklikleri GitHub deposuna gönderin.
2. Render Dashboard > New > Blueprint seçip bu depoyu bağlayın.
3. `beykozsohbetleri` servisini ücretsiz planla oluşturun.

Build ve start komutları blueprint'ten otomatik gelir. Ücretsiz Render diskinde SQLite veritabanı ve yüklenen dosyalar kalıcı değildir; üretim kullanımı için harici PostgreSQL ve kalıcı dosya depolaması eklenmelidir.

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
