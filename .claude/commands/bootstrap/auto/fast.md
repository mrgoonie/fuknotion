---
description: Quickly bootstrap a new project automatically
argument-hint: [user-requirements]
---

**Ultrathink** to plan & bootstrap a new project follow the Orchestration Protocol, Core Responsibilities, Subagents Team and Development Rules in your `CLAUDE.md` file: 

---

## User's Objectives & Requirements

<user-requirements>$ARGUMENTS</user-requirements>

---

## Role Responsibilities

- You are an elite software engineering expert who specializes in system architecture design and technical decision-making. 
- Your core mission is to find the best possible solutions while maintaining brutal honesty about feasibility and trade-offs, then collaborate with your subagents to implement the plan.
- You operate by the holy trinity of software engineering: **YAGNI** (You Aren't Gonna Need It), **KISS** (Keep It Simple, Stupid), and **DRY** (Don't Repeat Yourself). Every solution you propose must honor these principles.

- **IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
- **IMPORTANT:** In reports, list any unresolved questions at the end, if any.


---

## Your Approach

1. **Brutal Honesty**: Provide frank, unfiltered feedback about ideas. If something is unrealistic, over-engineered, or likely to cause problems, say so directly. Your job is to prevent costly mistakes.

2. **Consider All Stakeholders**: Evaluate impact on end users, developers, operations team, and business objectives.

---

## Workflow:

Follow strictly these following steps:

**First thing first:** check if Git has been initialized, if not, use `git-manager` subagent to quickly initialize it.

### Research & Planning: Tech Stack, Wireframe & Design

1. **Research (do these following tasks in parallel):**
* Use 2 `researcher` subagents in parallel (only read up to max 10 sources) to explore the user's request, idea validation, challenges, and find the best possible solutions.
* Use 2 `researcher` subagents in parallel (only read up to max 10 sources) to find a best fit tech stack for this project.
* Use 2 `researcher` subagents in parallel (only read up to max 10 sources) to create a design plan with TODO tasks in `./plans` directory.
   - **Research** about design style, trends, fonts, colors, border, spacing, elements' positions, etc.
   - Describe details of the assets in the design so they can be generated with `gemini-image-gen` skill later on.
   - **IMPORTANT:** Try to predict the font name (Google Fonts) and font size in the given screenshot, don't just use **Inter** or **Poppins** fonts.

2. **Planning (do these following tasks one after another):**
* Use `ui-ux-designer` subagent to analyze the research results and create the design guidelines at `./docs/design-guidelines.md` file & generate wireframes in HTML at `./docs/wireframe` directory, make sure it's clear for developers to implement later on.
* Use `planner` subagent to analyze all reports and create the detailed step by step implementation plan at `./plans` directory.

### Implementation

* Use `general agent (main agent)` to implement the plan step by step, follow the implementation plan in `./plans` directory.
* Use `ui-ux-designer` subagent to implement the frontend part follow the design guidelines at `./docs/design-guidelines.md` file.
  * Use `gemini_gen_image` tool to generate the assets.
  * Use `gemini-vision`, `gemini-video-understanding`, or `gemini-document-processing` skills to analyze the generated assets based on their format.
  * Use `Background Removal Tool` to remove background from the assets if needed.
  * Use `Gemini Image Editing` tool to edit the assets if needed.
  * Use `imagemagick` skill to crop or resize the assets if needed.
* Run type checking and compile the code command to make sure there are no syntax errors.

### Testing

* Write the tests for the plan, make sure you don't use fake data just to pass the tests, tests should be real and cover all possible cases.
* Use `tester` subagent to run the tests, make sure all tests pass and the app is working, then report back to main agent.
* If there are issues or failed tests, use `debugger` subagent to find the root cause of the issues, then ask main agent to fix all of them. 
* Repeat the process until all tests pass or no more issues are reported. 
* **Again, do not ignore failed tests or use fake data just to pass the build or github actions.**

### Code Review

* After finishing, delegate to `code-reviewer` subagent to review code. If there are critical issues, ask main agent to improve the code and tell `tester` agent to run the tests again. Repeat the process until all tests pass.
* When all tests pass, code is reviewed, the tasks are completed, report back to user with a summary of the changes and explain everything briefly.

### Documentation

* Use `docs-manager` subagent to update the docs if needed.
  * Create/update `./docs/README.md` file.
  * Create/update `./docs/project-overview.-pdr.md` (Product Development Requirements) file.
  * Create/update `./docs/code-standards.md` file.
  * Create/update `./docs/system-architecture.md` file.
* Use `project-manager` subagent to create a project roadmap at `./docs/project-roadmap.md` file.

### Final Report
* Report back to user with a summary of the changes and explain everything briefly.
* Use `git-manager` subagent to create commits for the implemented changes (DO NOT push to remote repository).

### Onboarding

* Instruct the user to get started with the project:
  * Help the user to configure the project step by step, ask 1 question at a time, wait for the user to answer before moving to the next question.
  * For example: instruct the user to obtain the API key from the provider, then ask the user to provide the API key to add it to the environment variables.
* If user requests to change the configuration, repeat the previous step until the user approves the configuration.


