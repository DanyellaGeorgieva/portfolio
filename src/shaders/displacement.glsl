vec3 displacedPosition = position + normalize(normal) * turbulence(position);
vec3 displacedNormal = normalize(normal);

// gen new normals
// https://discourse.threejs.org/t/calculating-vertex-normals-after-displacement-in-the-vertex-shader/16989
if (uFixNormals == 1.0) {
    float offset = 0.5 / 512.0;
    vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;
    vec3 displacedNeighbour1 = neighbour1 + normal * turbulence(neighbour1);
    vec3 displacedNeighbour2 = neighbour2 + normal * turbulence(neighbour2);

    // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

    // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
    displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
}