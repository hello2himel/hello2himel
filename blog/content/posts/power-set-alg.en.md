---
title: "2ⁿ: How Does This Formula for Finding Subsets of a Power Set Work?"
date: 2023-05-02
author: "Himel Das"
tags: ["Math Basics", "Curious Mind"]
categories: ["Mathematics"]
summary: "A simple explanation of how the 2ⁿ formula determines the subsets of a set."
translationKey: "power-set-alg"
autoTranslated: true
originalLang: "bn"
---

Perhaps all of us reading this article already know what a set is. In textbook language, a set is a well-defined collection of objects from the real or conceptual world. The first idea of sets was introduced by the German mathematician **Georg Cantor**. It was a groundbreaking event in the history of mathematics!

Now let's get back to the main topic with a different example. Enough theory.

Suppose there are three ways to get from your home to the bus stand, two ways from the bus stand to school, and four ways from school to the park. Now think — how many total combinations are there to get from your home to the park?

Look,

You have three roads to go from home to the bus stand. For now, let's just think about getting from home to school.

> Here, H represents the road from home to the bus stand, B represents the road from the bus stand to school. The number next to it is the road number.

```
H1→B1 [Home to bus stand first road, bus stand to school first road]
H1→B2 [Home to bus stand first road, bus stand to school second road]

H2→B1 [Home to bus stand second road, bus stand to school first road]
H2→B2 [Home to bus stand second road, bus stand to school second road]

H3→B1 [Home to bus stand third road, bus stand to school first road]
H3→B2 [Home to bus stand third road, bus stand to school second road]
```

See, the total number of roads is six. That is, it's the product of the number of roads from home→bus stand and bus stand→school, **3×2=6**.

Now think — how many total combinations would you get when going from home to the park?  
That's right, **3×2×4=24!**

---

What did we learn from this?

> Total number of combinations = Product of all possible ways.

Now let's go back to sets. Can you tell me, what is a power set?

A **power set** is the set of all possible combinations of elements in a given set.

Suppose,  
**A = {a, b, c}**

Then what can happen in P(A)?

```
a → present or absent
b → present or absent
c → present or absent
```

Our set A had three elements: a, b, c. Now, the combinations that can occur are:

1. a is present, but b is absent, c is absent → {a}  
2. a is absent, b is present, c is absent → {b}  
3. a is absent, b is absent, c is present → {c}  
4. a is present, b is present, c is absent → {a,b}  
5. a is present, b is absent, c is present → {a,c}  
6. a is absent, b is present, c is present → {b,c}  
7. a is absent, b is absent, c is absent → {}  

Here, we have 2 possibilities: 'present' and 'absent'.  
And the total number of possible ways is the number of elements in the set.

What did we learn a moment ago?

> Total number of combinations = Product of all possible ways.

We also know:

> The set made of all possible combinations of elements in a set is the power set.

See the similarity?

Finding the power set means finding all the combinations.  
So, if the number of possibilities is 2, and the number of elements in the set is 3,  
how many total combinations do we get?

Yes, you got it —  
**2×2×2 = 8**, in short, **2³ = 8**

In that case, if the number of elements in the set is *n*,  
then we get a total of **2ⁿ** combinations.

---

### 🧠 Quick Task

"There is a large sheet of paper with 64 small squares. It's somewhat like a chess board, but in this case all the squares are white. You have red, green, and yellow colours to paint those squares. You can paint all squares in one colour, or paint some squares red, others green, and if you wish, others yellow. However, no square can be left white. How many different combinations can you paint this sheet in?"

---

> I am no expert in mathematics, and I don't know much about it either. This article is primarily meant for school students, so I've addressed the reader as 'you' throughout the text. To older readers, this article might seem basic, and the informal address might feel unusual. I sincerely apologise for that.

---

✍️ **Himel**  
9th Grade  
Bogura Zilla School, Bogura
