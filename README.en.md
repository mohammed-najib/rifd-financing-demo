# RIFD / رِفد

An Arabic-first demo of the financing application journey, from choosing a product and saving a draft to document review, corrections and a final decision. It supports Arabic and English on desktop and smaller screens.

[Try the website](https://rifd-portfolio-mdnb.web.app) · [Watch the walkthrough](docs/demo/rifd-demo.mp4) · [العربية](README.md)

[![RIFD's Arabic financing product page](docs/images/rifd-overview.png)](docs/demo/rifd-demo.mp4)

The **5:40 walkthrough** has Arabic and English captions. It shows the updated local application and Jev features. Select the image or video link to watch or download it.

## What can you try?

- Complete a guided financing application, attach documents and save your work for later.
- Review applications as a staff member, request specific corrections and inspect the response.
- Follow status changes and notifications, print a summary and view a fictional repayment schedule after approval.
- Switch between Arabic and English, and recover from session expiry or conflicting edits.

## AI features

RIFD uses **TypeSafe's Jev** to help examine identity, business, financial and purchase documents:

- Short findings describe the apparent document type, readability and consistency with declared information.
- Reviewers can find supporting evidence and inspect a named field in an overlay dialog. A visual highlight appears when it passes verification.
- Applicable findings can be saved and reopened. Saved examples let visitors explore the experience without a new model request.

Real inference runs locally with `pnpm dev:jev` and requires a TypeSafe key. Starting a check sends selected pages and relevant information to TypeSafe. The hosted version may lag behind the local application. Suggestions can be wrong; the reviewer makes the decision. [Read the AI guide in Arabic](docs/ai-features.md).

## How was it built?

I built this project entirely using AI. I directed it through instructions, reviewed the results and requested changes. AI wrote and edited the code under my direction.

## Start here

- [Run locally, Arabic guide](docs/getting-started.md)
- [Try the website and follow the video, Arabic guide](docs/demo-guide.md)
- [Project story, Arabic](docs/case-study.md)
- [Documentation index](docs/README.md), including English guides to development, testing and architecture.

This is a demonstration with fictional people and data. Application records are stored in your browser. It provides no real financing, identity verification or payment processing.
