# Experimental Counterbalancing

This reading interface now supports **experimental counterbalancing** with 4 different text excerpts from *Pride and Prejudice*.

## How It Works

Each of the 4 interface modes (Tabbed, Clickable, Network, LLM Enhanced) can display any of the 4 text excerpts using URL parameters. This enables proper counterbalancing in your experiment.

## Available Excerpts

### Excerpt A - Opening Conversation (Default)
- Chapter 1: Mr. and Mrs. Bennet's famous opening dialogue
- Chapter 3: Discussion of Mr. Bingley
- Chapter 5: First impressions at the assembly

**Characters**: Mr. Bennet, Mrs. Bennet, Mr. Bingley, Mr. Darcy, Elizabeth, Jane

### Excerpt B - Elizabeth and Jane Discuss Wickham/Darcy
- Chapter 10: The sisters analyze Mr. Darcy's character

**Characters**: Elizabeth, Jane, Mr. Wickham, Mr. Darcy, Mr. Bingley

### Excerpt C - Assembly Ball
- Chapter 3: First impressions at the ball, Mr. Darcy's insult

**Characters**: Elizabeth, Mr. Darcy, Mr. Bingley, Jane

### Excerpt D - Family Dynamics
- Chapter 3: The Bennet family discusses Mr. Bingley's arrival

**Characters**: Mrs. Bennet, Mr. Bennet, Mr. Bingley, Lady Lucas

## Usage

Add the `excerpt` parameter to any mode's URL:

```
?mode=tabbed&excerpt=A
?mode=clickable&excerpt=B
?mode=network&excerpt=C
?mode=llm&excerpt=D
```

### Example Counterbalancing Design

**4×4 Latin Square Design**

| Participant | Tabbed | Clickable | Network | LLM Enhanced |
|-------------|--------|-----------|---------|--------------|
| Group 1     | A      | B         | C       | D            |
| Group 2     | B      | C         | D       | A            |
| Group 3     | C      | D         | A       | B            |
| Group 4     | D      | A         | B       | C            |

**URLs for Group 1:**
- `?mode=tabbed&excerpt=A`
- `?mode=clickable&excerpt=B`
- `?mode=network&excerpt=C`
- `?mode=llm&excerpt=D`

## Implementation Details

All four reader components ([TabbedReader.tsx](src/app/components/TabbedReader.tsx), [ClickableReader.tsx](src/app/components/ClickableReader.tsx), [NetworkReader.tsx](src/app/components/NetworkReader.tsx), [LLMReader.tsx](src/app/components/LLMReader.tsx)) now use the `getExcerptFromURL()` function to dynamically load the appropriate excerpt.

The excerpts are defined in [bookData.ts](src/app/data/bookData.ts):
- `excerptA` - Opening conversation
- `excerptB` - Elizabeth/Jane discussion
- `excerptC` - Assembly ball
- `excerptD` - Family dynamics

## Backward Compatibility

If no `excerpt` parameter is provided, the system defaults to **Excerpt A** for all modes. This ensures existing implementations continue to work without modification.

## For Your Research Paper

You can report this as:

> "The experiment used a 4×4 counterbalanced design, with each interface mode (Tabbed, Clickable, Network, LLM Enhanced) paired with one of four text excerpts from Pride and Prejudice. Excerpt assignment was rotated across participants using a Latin square design to control for order and content effects."
