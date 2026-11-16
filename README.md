# UH Sugar Land Student Center Web App

Individual project for CIS 2336 (Fall 2026) by Indy Chen (ichen9@cougarnet.uh.edu).

## Project structure

```text
CIS2336-FA26-project-IndyChen/
├── frontend/
│   ├── index.html        (Homepage: dynamic menu, media, Developer Contact)
│   ├── FAQ.html          (5 collapsible FAQ items)
│   ├── roombooking.html  (Room booking form, 5 rooms, client-side validation)
│   ├── reference.html    (AI prompts used)
│   ├── styles.css        (Shared styles)
│   └── script.js         (Nav menu, FAQ accordion, form validation)
├── backend/
│   └── app.js            (Node/Express server - Phase 3)
├── package.json
└── README.md
```

## Phase 2 (front-end): how to view it

No install is needed for the front-end. Open `frontend/index.html` in a browser
(or use the VS Code "Live Server" extension) and use the menu to visit each page.

What to check:

- **Home:** menu is built by JavaScript (the current page is highlighted; on a narrow window it becomes a Menu button). Remote images and an embedded video. "Developer Contact" section at the bottom.
- **FAQ:** click each of the 5 questions to open/close its answer.
- **Room Booking:** try submitting empty, a bad email, an end time before the start time, or too many people for a room to see the validation messages.
- **Reference:** the AI prompts used for this project.

Images come from picsum.photos and the video from YouTube, so an internet connection is needed to see them.

## Form submission (needed for Phase 3)

The booking form sends a `POST` request with JSON to `/api/book`:

```json
{ "name": "", "email": "", "room": "cougar-den", "date": "2026-12-01",
  "start": "10:00", "end": "11:30", "guests": 4, "purpose": "" }
```

The back-end should reply with `{ "success": true|false, "message": "..." }`
(HTTP 200 for confirmed, 409 for unavailable). Until the back-end exists, the form shows a
"couldn't reach the booking server" message after valid input.

## Running the full app (once the back-end is finished)

From the project root (the folder containing `frontend` and `backend`):

```bash
npm init -y
npm install express
node backend/app.js
```

Then open http://localhost:8080 in a browser.

## Submission

Final project code lives in my **personal** public GitHub repository (not a GitHub organization).
Nov 19 is a checkpoint to confirm the repo is public and accessible; final grading is after the full
project (front-end and back-end) is submitted by Dec 5.
