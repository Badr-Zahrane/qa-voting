# Concept Map – Q&A Voting App

The concept map shows the central concepts of our domain (live questions during a lecture or event) and how they relate to each other.

```mermaid
flowchart LR
    subgraph SM["Session Management"]
        Presenter([Presenter])
        Participant([Participant])
        Session[Session]
        Code[Session Code]
    end

    subgraph QA["Questions & Voting"]
        Question[Question]
        Vote[Vote]
        Ranking[Ranking]
    end

    subgraph IN["Insights"]
        Chart[Top Questions Chart]
        Category[Category / Group]
        AI([AI Assistant])
    end

    Presenter -- creates --> Session
    Session -- is identified by --> Code
    Participant -- joins with --> Code
    Presenter -- closes --> Session
    Session -- contains --> Question
    Participant -- submits --> Question
    Participant -- casts --> Vote
    Vote -- is given to --> Question
    Vote -- determines --> Ranking
    Ranking -- orders --> Question
    Presenter -- marks as answered / deletes --> Question
    Ranking -- is shown in --> Chart
    AI -- groups / categorizes --> Question
    Question -- belongs to --> Category
```

## Ubiquitous Language (shared vocabulary)

| Term | Meaning |
|---|---|
| **Presenter** | The person giving the lecture or talk; creates and manages a session |
| **Participant** | A member of the audience; joins a session, asks and votes |
| **Session** | One live Q&A event (e.g. one lecture) |
| **Session Code** | Short code (e.g. `AB12`) participants use to join a session |
| **Question** | A text submitted by a participant in a session |
| **Vote** | An upvote given by a participant to a question |
| **Ranking** | The order of questions by number of votes |
| **Answered** | State of a question the presenter has already answered |
| **Category / Group** | Topic or cluster of similar questions (assigned by the AI) |

## Bounded Contexts

| Context | Concepts | Responsibility | Code |
|---|---|---|---|
| **Session Management** | Presenter, Participant, Session, Session Code | Create, join and close sessions | `routes/sessions.js` |
| **Questions & Voting** | Question, Vote, Ranking | Submit questions, vote, sort by votes, mark as answered | `routes/questions.js`, `routes/votes.js` |
| **Insights** | Chart, Category / Group, AI Assistant | Visualize and organize questions | later sprints |

The AI is an external dependency: it is accessed only from the *Insights* context, behind a small adapter (anti-corruption layer), so its concepts do not leak into the core model.
