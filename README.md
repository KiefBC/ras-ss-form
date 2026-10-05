# RAS SS Form

TBD.

## Conventions

### Commit messages

Commits follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

| Type       | Use for                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only                                      |
| `style`    | Formatting with no change in behavior                   |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or correcting tests                              |
| `build`    | Build system or dependencies                            |
| `ci`       | CI configuration                                        |
| `chore`    | Maintenance that doesn't touch `src` or tests           |
| `revert`   | Reverts a previous commit                               |

Mark a breaking change with `!` after the type or scope (`feat(auth)!: drop magic links`),
or with a `BREAKING CHANGE:` footer.

### Branch names

Branches follow [Conventional Branch](https://conventional-branch.github.io/): `<type>/<description>`.

| Prefix                  | Use for                                     |
| ----------------------- | ------------------------------------------- |
| `feature/` (or `feat/`) | New features                                |
| `bugfix/` (or `fix/`)   | Bug fixes                                   |
| `hotfix/`               | Urgent fixes                                |
| `release/`              | Preparing a release (`release/v1.2.0`)      |
| `chore/`                | Non-code tasks such as dependencies or docs |

### Changelog

[CHANGELOG.md](CHANGELOG.md) follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
Every user-facing change adds an entry under `## [Unreleased]` in the same change that introduces it,
grouped as `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`.
At release time, `[Unreleased]` is renamed to the new version and date (`## [1.2.0] - 2026-10-03`).

### Versioning

The project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).
The version lives in `package.json`, and each release is tagged `vX.Y.Z`.

| Change                                    | Bump  |
| ----------------------------------------- | ----- |
| Breaking change (`!` / `BREAKING CHANGE`) | MAJOR |
| `feat`                                    | MINOR |
| `fix`, `perf`                             | PATCH |

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
