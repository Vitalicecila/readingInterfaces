# Experimental Counterbalancing Guide

## Latin Square Design (4x4)

This interface uses a **Latin square counterbalancing** design to control for order effects across 4 reading interfaces and 4 text excerpts.

### URL Parameter System

Participants access the study with a URL parameter that determines which excerpt they see in each interface:

```
?condition=1    (or 2, 3, 4)
```

### Counterbalancing Matrix

| Condition | Tabbed View | Clickable Names | Network View | LLM Enhanced |
|-----------|-------------|-----------------|--------------|--------------|
| 1         | Excerpt A   | Excerpt B       | Excerpt C    | Excerpt D    |
| 2         | Excerpt B   | Excerpt C       | Excerpt D    | Excerpt A    |
| 3         | Excerpt C   | Excerpt D       | Excerpt A    | Excerpt B    |
| 4         | Excerpt D   | Excerpt A       | Excerpt B    | Excerpt C    |

### Study URLs

Distribute these URLs to participants:

- **Condition 1**: `https://your-domain.com/?condition=1`
- **Condition 2**: `https://your-domain.com/?condition=2`
- **Condition 3**: `https://your-domain.com/?condition=3`
- **Condition 4**: `https://your-domain.com/?condition=4`

### Text Excerpts

- **Excerpt A**: Pride & Prejudice - Opening conversation between Mr. and Mrs. Bennet
- **Excerpt B**: Twenty Years After (Dumas) - Mazarin's political monologue
- **Excerpt C**: Pride & Prejudice - Assembly ball scene with Darcy and Bingley
- **Excerpt D**: Pride & Prejudice - Family dynamics and Mr. Bingley's arrival

### Reading Interfaces

1. **Tabbed View**: Separate tabs for reading and character information
2. **Clickable Names**: Popup cards when clicking character names
3. **Network View**: Interactive relationship network visualization
4. **LLM Enhanced**: AI-generated contextual descriptions inserted inline

### Implementation Details

The counterbalancing is implemented in `src/app/data/excerptLoader.ts` using the `getExcerptForMode()` function. Each reader component calls this function with its mode name to retrieve the appropriate excerpt based on the URL condition parameter.

### Randomization Recommendation

To minimize confounding variables:
1. Randomly assign participants to conditions 1-4
2. Ensure roughly equal sample sizes across conditions
3. Record the condition assignment for each participant in your data

### Data Analysis

When analyzing results, you can:
- Control for excerpt effects by including excerpt as a covariate
- Control for interface effects by including interface type as a factor
- Test for order effects by comparing conditions
- Aggregate across conditions to get overall interface effects
