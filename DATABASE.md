# DATABASE.md

# Myself - Firebase Database Design

Version: 1.0

## Overview

Backend:
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

Design Goals:
- Secure
- Scalable
- Offline-capable
- Fast synchronization

---

# Firestore Structure

```
users/
  {userId}/
    profile/
    settings/
    dashboard/
    tasks/
    habits/
    routines/
    goals/
    projects/
    notes/
    journals/
    study/
    coding/
    pomodoro/
    analytics/
    achievements/
    notifications/
```

---

# users/{userId}

Stores profile information.

Fields

- uid
- name
- email
- photoURL
- createdAt
- updatedAt
- timezone
- language

---

# settings

- theme
- accentColor
- notificationEnabled
- reminderSound
- vibration
- weekStartsOn
- backupEnabled

---

# tasks

Fields

- title
- description
- priority
- status
- dueDate
- reminder
- projectId
- goalId
- labels[]
- checklist[]
- estimatedMinutes
- actualMinutes
- completedAt
- createdAt
- updatedAt

---

# habits

Fields

- title
- icon
- color
- frequency
- target
- streak
- longestStreak
- completionHistory[]
- createdAt

---

# routines

Fields

- title
- description
- startTime
- repeatDays[]
- reminder
- completed
- streak
- icon
- color

---

# goals

Fields

- title
- description
- category
- targetDate
- progress
- milestones[]
- completed

---

# projects

Fields

- title
- description
- color
- icon
- progress
- deadline
- taskIds[]
- createdAt

---

# notes

Fields

- title
- content
- tags[]
- pinned
- locked
- attachments[]
- updatedAt

---

# journals

Fields

- date
- mood
- gratitude
- wins
- challenges
- lessons
- content
- photos[]

---

# study

Fields

- subject
- topic
- duration
- date
- completed

---

# coding

Fields

- language
- project
- duration
- repository
- technologies[]
- date

---

# pomodoro

Fields

- sessionType
- duration
- breakDuration
- completed
- startedAt
- endedAt

---

# analytics

Store daily aggregates:

- tasksCompleted
- habitsCompleted
- routinesCompleted
- focusMinutes
- studyMinutes
- codingMinutes
- xpEarned

---

# achievements

Fields

- title
- description
- unlocked
- unlockedAt

---

# notifications

Fields

- title
- body
- scheduledAt
- type
- completed

---

# Firebase Storage

```
users/{uid}/profile/
users/{uid}/notes/
users/{uid}/journal/
users/{uid}/attachments/
```

---

# Security Rules (Summary)

- Users can access only their own documents.
- Authentication required.
- Validate ownership on every read/write.
- Deny anonymous access.

---

# Index Recommendations

Composite indexes:

- tasks(status, dueDate)
- tasks(projectId, status)
- habits(createdAt)
- journals(date)
- coding(date)
- analytics(date)

---

# Future Expansion

- Shared Projects
- Team Workspaces
- Family Accounts
- Calendar Sharing
- Wear OS Sync
