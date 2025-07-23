#ifndef RENDER_EFFECTS_GLSL
#define RENDER_EFFECTS_GLSL

#include "../core/math.glsl"
#include "../color_implicit/visualization.glsl"
#include "../implicit/primitives.glsl"

// From: drawing.glsl:260
vec4 drawArrow(vec2 p, vec2 startPt, vec2 endPt, vec4 color, vec4 base) {
    vec2 delta = startPt - endPt;
    vec2 arrowNormal = vec2(delta.y, -delta.x);
    Implicit arrowSpine = Plane(p, endPt, arrowNormal);
    mat2 arrowSideRotation = Rotate2D(PI / 12.0);

    Implicit tip1 = Plane(p, endPt, -arrowNormal * arrowSideRotation);
    Implicit tip2 = Plane(p, endPt, arrowNormal * inverse(arrowSideRotation));
    Implicit tipMax = Max(tip1, tip2);

    vec2 spineDir = normalize(delta);
    vec2 arrowBackPt = endPt + arrowSize * spineDir;
    vec2 arrowTailPt = startPt;

    Implicit backPlane = Plane(p, arrowBackPt, delta);
    tipMax = Max(tipMax, backPlane);

    Implicit spineBound = Shell(Plane(p, 0.5 * (arrowBackPt + arrowTailPt), spineDir), length(arrowBackPt - arrowTailPt), 0.0);

    // Convert to ColorImplicit before stroking/filling
    ColorImplicit spineColor = ColorImplicit(arrowSpine.Distance, arrowSpine.Gradient, color);
    ColorImplicit tipColor = ColorImplicit(tipMax.Distance, tipMax.Gradient, color);

    if (spineBound.Distance < 0.0 && dot(spineDir, arrowBackPt - arrowTailPt) < 0.0)
        base = strokeImplicit(spineColor, 4.0, base);

    return fillImplicit(tipColor, base);
}

// From: drawing.glsl:153
vec4 DrawVectorField(vec3 p, ColorImplicit iImplicit, float iSpacing, float iLineHalfThick, vec4 iColor)
{
    vec2 spacingVec = vec2(iSpacing);
    vec2 param = mod(p.xy, spacingVec);
    vec2 center = p.xy - param + 0.5 * spacingVec;
    vec2 toCenter = p.xy - center;

    float gradParam = dot(toCenter, iImplicit.Gradient.xy) / length(iImplicit.Gradient);
    float gradLength = length(iImplicit.Gradient);

    float circleSizeFactor = max(length(iImplicit.Gradient.xy) / gradLength, 0.2);
    bool isInCircle = length(p.xy - center) < iSpacing * 0.45 * circleSizeFactor;
    bool isNearLine = abs(dot(toCenter, vec2(-iImplicit.Gradient.y, iImplicit.Gradient.x))) / gradLength < iLineHalfThick + (-gradParam + iSpacing * 0.5) * 0.125;

    if (isInCircle && isNearLine)
        return vec4(iColor.rgb * 0.5, 1.0);

    return iColor;
}

// From: drawing.glsl:42
#endif // RENDER_EFFECTS_GLSL
