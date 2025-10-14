# Contributing to the Agentic AI App Generator

Thank you for your interest in contributing! To ensure a smooth and efficient development process, please review and adhere to the following checklist before submitting a pull request.

## Contributor Checklist

Before you submit your PR, please make sure you have completed the following steps:

- [ ] **Accessibility (A11y):** I have tested my changes for accessibility.
    -   All interactive elements are keyboard-navigable.
    -   All images have appropriate `alt` text.
    -   Forms use semantic HTML, including `<label>` elements with `for` attributes.
    -   Interactive elements without visible text (e.g., icon buttons) have descriptive `aria-label` attributes.
    -   Color contrast meets WCAG AA standards.

- [ ] **Tests:** I have added or updated tests to cover my changes.
    -   Unit tests have been added for new functions or components.
    -   Existing tests have been updated to reflect my changes.
    -   All tests pass locally (`npm test`).

- [ ] **CI Checks:** The continuous integration (CI) pipeline passes for my branch.
    -   Linting checks pass.
    -   Build process completes successfully.
    -   All automated tests in the CI environment pass.

- [ ] **Documentation:** I have updated the documentation to reflect my changes.
    -   README.md is updated if my changes affect setup or usage.
    -   Code comments are added for complex logic.
    -   Component props are documented using JSDoc comments.

- [ ] **Self-Review:** I have performed a self-review of my own code.
    -   My code follows the project's coding style and conventions.
    -   I have removed any commented-out code and console.log statements.
    -   The code is modular and easy to understand.

By checking these boxes, you are confirming that your contribution is ready for review. This helps our maintainers review and merge your work faster.
