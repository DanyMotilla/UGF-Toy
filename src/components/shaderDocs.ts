// Documentation pages for the shader editor
export const shaderDocs = [
    // Page 1: Introduction and Fields
    `# Unit Gradient Fields: SDFs, UGFs, and their friends

## Introduction

This documentation explores the mathematical foundations of Signed Distance Fields (SDFs), Unit Gradient Fields (UGFs), and related concepts. For rigorous definitions, see [Luo, Wang, and Lukens's framing of SDFs using Variational Analysis](https://link.springer.com/article/10.1007/s10957-018-1414-2).

## Fields

Fields are functions mapping a smoothly curved space, usually $\\R^n$, to the affinely extended reals $\\overline\\R \\equiv \\R \\cup \\{\\pm\\infty\\}$. The extended reals allow us to define the ends of the real number line to be closed instead of open, even when dividing by zero (except for 0/0).

## Unit Gradient Fields (UGFs)

UGFs are fields with unit gradient magnitude, everywhere the gradient exists. While commonly used to represent shapes, they don't necessarily need to have non-positive values, as adding a constant to a UGF doesn't change its gradient.`,

    // Page 2: Distance Fields and Boundary Maps
    `# Distance Fields and Boundary Concepts

## Distance Fields

Distance fields (DFs) are defined by:
- The difference of the unsigned distance to a set minus the unsigned distance to the set's complement
- The distance to a set from its inside is zero
- The piecewise definition is $C^1$ continuous across the set's boundary
- DFs are UGFs when defined by proper sets
- When DFs have an interior, we call them "signed" SDFs

DFs contain more information about a shape than a UGF representing the same shape. For example, the sum of two DFs represents the local clearance between parts.

## The Boundary Map

The boundary map (represented by a vector) points from any point $\\p$ to the closest point on the surface of a set represented by a DF $\\df{F}$. Distance fields can be thought of as the magnitude of these boundary map vector fields.

## The Normal Cone

The normal cone can be constructed using the boundary map. For two SDFs $\\df{A}(\\p)$ and $\\df{B}(\\p)$, the normal cone for $\\ugf{F} = \\df{A} \\distanceCap \\df{B}$ defines important geometric properties.`,

    // Page 3: Boolean Operations and Blending
    `# Boolean Operations and Blending

## Distance-Preserving Boolean Operations

We can define:
- Minmax Booleans ($\\minmaxCup$ and $\\minmaxCap$) using $\\min$ and $\\max$
- DF-preserving Booleans ($\\distanceCup$ and $\\distanceCap$)
  - Defined piecewise across the boundary of the normal cone
  - Outside the normal cone: same as minmax Booleans
  - Inside: uses distance to the curve of intersection

## Blending Techniques

### 1. Euclidean Blend
Korndörfer's elegant approach applies the blend to the entire remote quadrant of the intersection instead of just the normal cone.

### 2. Quilez Blend
Inigo Quilez's "smooth minimum functions" blend the entire discontinuity typically produced by $\\min$. With constant blend radius, they use an estimate of distance-to-curve for their intersection.

### 3. Rvachev Blend
Rvachev identified and classified logic-preserving implicit functions (R-functions). The $\\vee_0$ operation is an AUGF, though its remote field departs from unit magnitude.
`
];
