/** Indexed Gemini prompts — one per nature. Do not paraphrase at call time. */

import { buildStyleLookInstruction } from './styleReference';

const withLookAccuracy = (lookName: string, brief: string) =>
  `${buildStyleLookInstruction(lookName)}

${brief}`;

export const RESPONSABLE_PROMPT = withLookAccuracy(
  'RESPONSABLE',
  `Generate exactly ONE single photographic image.

Create a vertical 4:5 premium lifestyle editorial photograph inspired by the restrained, human and sophisticated visual language of a contemporary Volvo campaign.

Use the attached webcam photograph as the reference for the real person or people.

IMPORTANT:
Do NOT treat the source photograph as a cutout to paste onto a new background.

RE-PHOTOGRAPH the same person or people as if they had genuinely been physically present in the new environment when the photograph was taken.

The final image must look like ONE REAL CAMERA EXPOSURE, not a background replacement.

IDENTITY AND CONTENT PRESERVATION

Preserve the exact identity of every real person in the reference:

* recognisable facial structure
* age
* skin tone
* hairstyle
* facial hair
* glasses
* tattoos
* piercings
* makeup
* accessories
* clothing
* clothing colours and patterns
* visible personal objects or drinks
* original pose logic
* gestures
* body direction
* relationship and social energy between people

Preserve exactly the same number of people shown in the source photograph.

Never add, remove, duplicate, replace, merge or omit a person.

The person's identity, wardrobe and pose must remain faithful to the source.

However, the SUBJECT MUST BE PHOTOGRAPHICALLY RE-RENDERED to belong naturally to the new location.

ENVIRONMENTAL RELIGHTING IS REQUIRED.

Do not preserve the original webcam lighting.

Replace the original source lighting with physically believable lighting from the new environment.

The new environment must affect the person naturally:

* dawn light illuminating the face according to its real direction
* cool ambient skylight filling the shadow side of the face
* subtle warm dawn light touching skin, hair and clothing
* realistic contact shadows
* realistic light falloff across the body
* environmental colour reflected subtly onto skin and fabric
* atmospheric light interacting naturally with hair edges
* realistic translucency on ears and skin where appropriate
* clothing must respond naturally to the new light
* original webcam highlights and indoor colour casts should disappear
* eliminate any visible edge, halo or masking sensation around the person

The person must not look brighter, sharper, warmer or flatter than the surrounding environment.

MATCH THE SUBJECT TO THE SCENE:
same white balance,
same exposure,
same contrast,
same shadow softness,
same highlight rolloff,
same atmospheric perspective,
same optical sharpness,
same depth of field,
same photographic grain.

The result should look as though the camera, the person and the landscape were all physically present together.

COMPOSITION

The people must remain the main visual element.

For ONE person:
medium portrait, approximately two-thirds of the visual composition.

For TWO, THREE or FOUR people:
preserve the original relationship, natural spacing, body orientation and group energy.

Do not force people into a symmetrical row.

Keep all faces recognisable and naturally visible.

Allow enough environment around the subjects to establish the location convincingly.

Camera at approximately eye level.

Natural portrait lens perspective, approximately equivalent to 50–70 mm full frame.

Avoid an overly shallow artificial portrait blur.

RESPONSABLE — ENVIRONMENT

Place the person or people beside a quiet Nordic or northern-European lake at very early dawn.

Environment:

* still calm lake water
* subtle rocky shoreline
* sparse Nordic vegetation
* restrained conifers
* delicate grasses
* clean open air
* tiny distant birds
* no buildings
* no road
* no vehicles
* no urban furniture

Emotional tone:
responsible,
grounded,
calm,
dependable,
quietly optimistic,
human,
slightly poetic.

LIGHTING

Very early Nordic dawn.

The atmosphere should contain a restrained combination of:

* cool blue-grey ambient skylight
* soft neutral fill
* a delicate warm dawn component
* very subtle orange warmth only where physically justified

Avoid golden-hour orange saturation.

The warm light must be subtle and naturally directional.

The scene should feel fresh and alive, not cold, depressing or sleepy.

MIST — ONLY POETIC ACCENT

Use natural dawn mist as the only poetic visual accent.

Create three subtle atmospheric depths:

1. A clearly readable low mist layer floating horizontally above the lake surface.

2. A softer middle atmospheric mist layer separating the distant trees from the lake.

3. A very delicate foreground atmospheric veil if useful for depth.

The foreground mist may partially cross clothing or the lower body, but it must interact naturally with scene depth.

Never cover the face significantly.

The mist must feel like real humidity illuminated by dawn light, not artificial smoke.

It should be noticeable within approximately two seconds while remaining elegant and realistic.

PHOTOGRAPHIC CHARACTER

High-end Scandinavian lifestyle editorial photography.

Human.
Natural.
Contemporary.
Restrained.
Sober.
Quietly sophisticated.

Real skin texture.
Visible pores.
Natural facial micro-detail.
Realistic hair.
Believable textile fibres.
Moderate contrast.
Soft highlight rolloff.
Detailed shadows.
Subdued colour palette.

No HDR.
No glamour retouching.
No plastic skin.
No artificial cinematic colour grading.
No excessive teal-orange look.

CRITICAL INTEGRATION RULE

Before finalising the image, visually treat the person and the landscape as one photographic lighting problem.

The landscape must illuminate the person.

The atmosphere must affect the person.

The subject must cast and receive light consistently with the scene.

Hair, skin, clothing and accessories must respond to the surrounding dawn illumination.

There must be NO evidence that the original webcam photograph was simply masked, cut out or pasted over another image.

If necessary, regenerate the visual appearance of the person's skin, hair and clothing under the new lighting while preserving their identity, wardrobe, pose and recognisable features.

FINAL IMAGE MUST PASS THIS TEST:

It should be impossible to visually identify where the original webcam photograph ends and the generated environment begins.

NEGATIVE CONSTRAINTS

Do not create:
text,
logos,
Volvo branding,
graphics,
frames,
interfaces,
cars,
vehicles,
roads,
buildings,
urban furniture,
visible studio lights,
festival structures,
cables,
extra people,
collage,
diptych,
multiple panels.

Reject any result where:

* identity changes
* clothing changes materially
* pose changes unnecessarily
* the original webcam lighting remains visible
* there is a cutout edge or halo
* subject and background have different white balance
* subject appears pasted into the image
* background blur and subject sharpness do not belong to the same lens
* mist looks artificial
* image becomes excessively cold or melancholic
* the scene loses the original person's energy
`,
);

export const EFICIENTE_PROMPT = withLookAccuracy(
  'EFICIENTE',
  `Generate exactly ONE single photographic image.

Create a vertical 4:5 premium lifestyle editorial photograph inspired by the restrained, human and sophisticated visual language of a contemporary Volvo campaign.

Use the attached webcam photograph as the reference for the real person or people.

IMPORTANT:
Do NOT treat the source photograph as a cutout to paste onto a new background.

RE-PHOTOGRAPH the same person or people as if they had genuinely been physically present in the new natural environment when the photograph was taken.

The final image must look like ONE REAL CAMERA EXPOSURE, not a background replacement or composite.

IDENTITY AND CONTENT PRESERVATION

Preserve the exact identity of every real person in the reference:

* recognisable facial structure
* age
* skin tone
* natural skin characteristics
* hairstyle
* facial hair
* glasses
* tattoos
* piercings
* makeup
* accessories
* clothing
* clothing colours and patterns
* visible personal objects
* original pose logic
* gestures
* body direction
* direction of gaze
* relationship and social energy between people

Preserve exactly the same number of people shown in the source photograph.

Never add, remove, duplicate, replace, merge or omit a person.

The person's identity, wardrobe and pose must remain faithful to the source.

Do not redesign the wardrobe.
Do not neutralise colourful clothes.
Do not turn the person into a generic fashion model.
Do not unnecessarily correct or editorialise their personality.

However, the SUBJECT MUST BE PHOTOGRAPHICALLY RE-RENDERED to belong naturally to the new location.

ENVIRONMENTAL RELIGHTING IS REQUIRED.

Do not preserve the original webcam lighting.

Replace the original source lighting with physically believable natural daylight from the new environment.

The environment must affect the person naturally:

* soft daylight illuminating the face according to the real light direction
* natural skylight filling the shadow side
* subtle warm daylight touching skin, hair and clothing
* realistic light falloff across the face and body
* believable contact and body shadows
* subtle environmental colour reflected naturally onto skin and fabric
* realistic light interaction with individual hair strands
* natural translucency on ears and skin where physically appropriate
* clothing materials responding naturally to the daylight
* eliminate original indoor or webcam colour casts
* eliminate original artificial highlights
* eliminate visible masking edges, halos or cutout contours

The person must not look brighter, flatter, sharper, warmer or more contrasty than the environment.

MATCH THE SUBJECT TO THE SCENE:
same white balance,
same exposure,
same contrast,
same shadow softness,
same highlight rolloff,
same atmospheric perspective,
same optical sharpness,
same depth of field,
same photographic grain.

The result should look as though the camera, the person, the landscape and every airborne particle were physically present together.

COMPOSITION

The people must remain the main visual element.

For ONE person:
create a medium editorial portrait with the user as the clear protagonist, occupying approximately two-thirds of the important visual area.

For TWO people:
preserve their relationship, spacing and shared pose logic.

For THREE people:
preserve the group structure, relative positions and social energy.

For FOUR people:
preserve the original arrangement and natural group dynamics.

Do not force people into an artificial symmetrical row.

Keep all faces naturally visible and recognisable.

Preserve the source pose logic as faithfully as possible.

Allow enough environment around the subject to make the new location believable and spacious.

Reserve a relatively calm, visually clean area in the UPPER-RIGHT quadrant for possible future graphic placement.

This upper-right zone should preferably contain:

* open sky
* distant soft landscape
* a simple hillside
* atmospheric background

Do not place:

* faces
* important hands
* dense particle clusters
* major foreground objects
* visually dominant landscape features

inside that reserved zone.

The reserved area must still feel naturally part of the photograph, never like an empty graphic box.

Camera approximately at eye level.

Natural portrait lens perspective, approximately equivalent to 50–70 mm full frame.

Moderate depth of field.

Avoid exaggerated telephoto compression or extremely shallow artificial background blur.

NATURALEZA EFICIENTE — ENVIRONMENT

Place the person or people in a quiet open natural landscape inspired by northern or central European mountain environments.

Environment:

* gentle mountain plateau or elevated meadow
* natural meadow terrain
* restrained exposed rock
* low vegetation
* delicate wildflowers
* subtle grasses
* distant soft hills or low mountains
* clear open air
* generous sense of space and depth

The landscape must feel real, accessible and understated.

Avoid dramatic alpine peaks or heroic landscapes.

The environment should communicate:
balance,
efficiency,
natural intelligence,
harmony,
lightness,
respect for nature,
quiet optimism.

LIGHTING

Use clean, soft natural daylight corresponding approximately to 10:00 AM.

The light should feel bright but gentle.

Use:

* soft neutral daylight
* very subtle warm component
* natural sky fill
* moderate contrast
* contained highlights
* readable shadow detail
* clean, refined atmosphere

Natural colour palette:
restrained greens,
earth tones,
soft stone colours,
clean natural sky.

Avoid:
golden-hour orange saturation,
dramatic sunrise,
dramatic sunset,
epic clouds,
high-contrast sunlight,
HDR,
excessive saturation,
cinematic teal-and-orange grading.

The photograph should feel luminous and optimistic without looking commercially glossy or artificial.

POETIC ACCENT — ORGANIC AIRFLOW

Use exactly ONE distinctive poetic phenomenon:

A single organic airflow carrying small pieces of lightweight botanical matter through the scene.

This airflow is a REAL PHYSICAL EVENT captured by the camera.

It must NEVER look like:

* graphic design
* an illustration
* a Photoshop overlay
* CGI ribbons
* digital particles
* glowing particles
* sparkles
* butterflies
* confetti
* magic dust
* smoke
* a decorative semicircle

The airflow itself is invisible.

It becomes visible only because natural moving air carries very small lightweight botanical elements such as:

* tiny airborne seeds
* delicate seed tufts
* fine botanical filaments
* tiny dry plant fragments
* very small lightweight natural fibres

These botanical particles should feel physically real, delicate and numerous enough to reveal the air movement, but never massive or overwhelming.

No artificial glow.

No luminous particles.

No fantasy effect.

AIRFLOW TRAJECTORY

Create ONE continuous, elegant and organically curved airflow trajectory.

The airflow should:

* enter from a foreground area relatively close to camera
* travel naturally through the composition
* curve gently around the subject or group
* continue into the middle and distant background
* create a readable sense of circulation and movement

The overall path should be understandable immediately, but never perfectly geometric.

It must feel irregular and physically plausible.

Avoid:

* perfect circles
* perfect spirals
* symmetrical arcs
* rigid semicircles
* graphic swooshes
* vortex shapes

Introduce natural variation:

* slightly denser particle regions
* more open gaps
* small deviations
* isolated particles escaping the main path
* subtle directional changes
* realistic variation in particle orientation

The flow should communicate natural efficiency rather than spectacle.

TRUE THREE-DIMENSIONAL DEPTH

Particle depth variation is mandatory.

Create at least three natural depth behaviours:

FOREGROUND PARTICLES:
A small number of botanical fragments relatively close to camera.
They may appear slightly larger, softly defocused and show subtle realistic motion blur.

SUBJECT-PLANE PARTICLES:
The most readable part of the airflow.
Small and delicate particles moving near or around the person's spatial plane.
These particles should have believable sharpness consistent with the lens depth of field.

BACKGROUND PARTICLES:
Very small, sparse botanical fragments continuing into the distant scene.
They should become progressively smaller, softer and less contrasty due to distance and atmospheric perspective.

The differences in scale, focus, contrast and movement must make the airflow genuinely three-dimensional.

The particles must obey the SAME:
light direction,
depth of field,
camera exposure,
motion behaviour,
colour system,
atmospheric perspective

as the rest of the photograph.

INTERACTION WITH THE SUBJECT

The airflow may naturally curve around the person.

Some particles may pass:

* beside the head
* near the shoulders
* partially in front of clothing
* across lower torso areas
* through lateral parts of the frame

but the face must remain clean and clearly readable.

Do not create a dense particle layer directly over:
eyes,
nose,
mouth,
important facial features.

Do not create the impression that particles have been painted over the final photograph.

Where particles pass in front of clothing or body areas, depth and focus must make their physical position believable.

The subject remains the protagonist.

The airflow supports the concept of NATURALEZA EFICIENTE; it never becomes the main character.

PHOTOGRAPHIC CHARACTER

High-end Scandinavian lifestyle editorial photography.

Human.
Natural.
Contemporary.
Elegant.
Restrained.
Premium.
Quietly sophisticated.
Luminous.
Emotionally believable.

Real skin texture.
Visible natural pores.
Real hair.
Believable textile fibres.
Natural garment folds.
Moderate contrast.
Soft highlight rolloff.
Detailed shadows.
Contained colour.

No HDR.
No plastic skin.
No excessive skin smoothing.
No synthetic hyper-sharpness.
No artificial cinematic grading.
No generic stock-photo aesthetic.

CRITICAL INTEGRATION RULE

Before finalising the image, visually treat the PERSON, LANDSCAPE and AIRBORNE BOTANICAL PARTICLES as ONE SINGLE PHOTOGRAPHIC LIGHTING AND CAMERA PROBLEM.

The landscape must illuminate the person.

The daylight must modify the original webcam appearance of the person.

The particles must receive exactly the same environmental light.

The particles must exist at believable distances from the lens and subject.

The subject must cast and receive light consistently with the terrain and atmosphere.

Hair, skin, clothing, accessories, vegetation and particles must all respond to the same physical environment.

There must be NO evidence that:

* the person was cut from another photograph
* the landscape was added afterwards
* the particles were added as an overlay

If necessary, regenerate the visual appearance of the person's skin, hair and clothing under the new daylight while preserving exact identity, wardrobe, pose and recognisable features.

FINAL IMAGE MUST PASS THIS TEST:

It should be impossible to visually identify where the original webcam photograph ends and the generated environment begins.

It should also be impossible to identify the botanical airflow as a separate graphic layer.

Everything must feel captured simultaneously by one real camera in one real location.

NEGATIVE CONSTRAINTS

Do not create:
text,
logos,
Volvo branding,
graphics,
frames,
interfaces,
cars,
vehicles,
roads,
buildings,
urban furniture,
visible studio equipment,
extra people,
collage,
diptych,
multiple panels,
graphic particles,
glowing particles,
magical effects,
confetti,
butterflies,
sparkles,
CGI ribbons,
perfect particle circles,
perfect spirals.

Reject any result where:

* identity changes
* clothing changes materially
* pose changes unnecessarily
* original webcam lighting remains visible
* subject has a cutout edge or halo
* subject and environment have different white balance
* subject looks pasted into the landscape
* particles look like an overlay
* particles look digitally generated
* particles form a perfect geometric shape
* particles obscure the face
* foreground and background particles have identical sharpness
* landscape becomes excessively dramatic
* colour becomes excessively saturated
* image feels like generic stock advertising
* skin becomes artificial
* anatomy or hands become deformed
* the original person's energy is lost

Output only the final photographic image.
`,
);

export const CUIDADOSA_PROMPT = withLookAccuracy(
  'CUIDADOSA',
  `Generate exactly ONE single photographic image.

Create a vertical 4:5 premium lifestyle editorial photograph inspired by the restrained, human and sophisticated visual language of a contemporary Volvo campaign.

Use the attached webcam photograph as the reference for the real person or people.

IMPORTANT:
Do NOT treat the source photograph as a cutout to paste onto a new background.

RE-PHOTOGRAPH the same person or people as if they had genuinely been physically present in the new natural environment when the photograph was taken.

The final image must look like ONE REAL CAMERA EXPOSURE, not a background replacement or composite.

IDENTITY AND CONTENT PRESERVATION

Preserve the exact identity of every real person in the reference:

* recognisable facial structure
* age
* skin tone
* natural skin characteristics
* hairstyle
* facial hair
* glasses
* tattoos
* piercings
* makeup
* accessories
* clothing
* clothing colours and patterns
* visible personal objects
* original pose logic
* gestures
* body direction
* direction of gaze
* relationship and social energy between people

Preserve exactly the same number of people shown in the source photograph.

Never add, remove, duplicate, replace, merge or omit a person.

The person's identity, wardrobe and pose must remain faithful to the source.

Do not redesign the wardrobe.
Do not neutralise colourful clothes.
Do not turn the person into a generic fashion model.
Do not unnecessarily correct or editorialise their personality.

However, the SUBJECT MUST BE PHOTOGRAPHICALLY RE-RENDERED to belong naturally to the new location.

ENVIRONMENTAL RELIGHTING IS REQUIRED.

Do not preserve the original webcam lighting.

Replace the original source lighting with physically believable natural daylight from the new environment.

The environment must affect the person naturally:

* soft daylight illuminating the face according to the real light direction
* natural skylight filling the shadow side
* subtle warm daylight touching skin, hair and clothing
* realistic light falloff across the face and body
* believable contact and body shadows
* subtle environmental colour reflected naturally onto skin and fabric
* realistic light interaction with individual hair strands
* natural translucency on ears and skin where physically appropriate
* clothing materials responding naturally to the daylight
* eliminate original indoor or webcam colour casts
* eliminate original artificial highlights
* eliminate visible masking edges, halos or cutout contours

The person must not look brighter, flatter, sharper, warmer or more contrasty than the environment.

MATCH THE SUBJECT TO THE SCENE:
same white balance,
same exposure,
same contrast,
same shadow softness,
same highlight rolloff,
same atmospheric perspective,
same optical sharpness,
same depth of field,
same photographic grain.

The result should look as though the camera, the person, the landscape and every airborne particle were physically present together.

COMPOSITION

The people must remain the main visual element.

For ONE person:
create a medium editorial portrait with the user as the clear protagonist, occupying approximately two-thirds of the important visual area.

For TWO people:
preserve their relationship, spacing and shared pose logic.

For THREE people:
preserve the group structure, relative positions and social energy.

For FOUR people:
preserve the original arrangement and natural group dynamics.

Do not force people into an artificial symmetrical row.

Keep all faces naturally visible and recognisable.

Preserve the source pose logic as faithfully as possible.

Allow enough environment around the subject to make the new location believable and spacious.

Reserve a relatively calm, visually clean area in the UPPER-RIGHT quadrant for possible future graphic placement.

This upper-right zone should preferably contain:

* open sky
* distant soft landscape
* a simple hillside
* atmospheric background

Do not place:

* faces
* important hands
* dense particle clusters
* major foreground objects
* visually dominant landscape features

inside that reserved zone.

The reserved area must still feel naturally part of the photograph, never like an empty graphic box.

Camera approximately at eye level.

Natural portrait lens perspective, approximately equivalent to 50–70 mm full frame.

Moderate depth of field.

Avoid exaggerated telephoto compression or extremely shallow artificial background blur.

NATURALEZA EFICIENTE — ENVIRONMENT

Place the person or people in a quiet open natural landscape inspired by northern or central European mountain environments.

Environment:

* gentle mountain plateau or elevated meadow
* natural meadow terrain
* restrained exposed rock
* low vegetation
* delicate wildflowers
* subtle grasses
* distant soft hills or low mountains
* clear open air
* generous sense of space and depth

The landscape must feel real, accessible and understated.

Avoid dramatic alpine peaks or heroic landscapes.

The environment should communicate:
balance,
efficiency,
natural intelligence,
harmony,
lightness,
respect for nature,
quiet optimism.

LIGHTING

Use clean, soft natural daylight corresponding approximately to 10:00 AM.

The light should feel bright but gentle.

Use:

* soft neutral daylight
* very subtle warm component
* natural sky fill
* moderate contrast
* contained highlights
* readable shadow detail
* clean, refined atmosphere

Natural colour palette:
restrained greens,
earth tones,
soft stone colours,
clean natural sky.

Avoid:
golden-hour orange saturation,
dramatic sunrise,
dramatic sunset,
epic clouds,
high-contrast sunlight,
HDR,
excessive saturation,
cinematic teal-and-orange grading.

The photograph should feel luminous and optimistic without looking commercially glossy or artificial.

POETIC ACCENT — ORGANIC AIRFLOW

Use exactly ONE distinctive poetic phenomenon:

A single organic airflow carrying small pieces of lightweight botanical matter through the scene.

This airflow is a REAL PHYSICAL EVENT captured by the camera.

It must NEVER look like:

* graphic design
* an illustration
* a Photoshop overlay
* CGI ribbons
* digital particles
* glowing particles
* sparkles
* butterflies
* confetti
* magic dust
* smoke
* a decorative semicircle

The airflow itself is invisible.

It becomes visible only because natural moving air carries very small lightweight botanical elements such as:

* tiny airborne seeds
* delicate seed tufts
* fine botanical filaments
* tiny dry plant fragments
* very small lightweight natural fibres

These botanical particles should feel physically real, delicate and numerous enough to reveal the air movement, but never massive or overwhelming.

No artificial glow.

No luminous particles.

No fantasy effect.

AIRFLOW TRAJECTORY

Create ONE continuous, elegant and organically curved airflow trajectory.

The airflow should:

* enter from a foreground area relatively close to camera
* travel naturally through the composition
* curve gently around the subject or group
* continue into the middle and distant background
* create a readable sense of circulation and movement

The overall path should be understandable immediately, but never perfectly geometric.

It must feel irregular and physically plausible.

Avoid:

* perfect circles
* perfect spirals
* symmetrical arcs
* rigid semicircles
* graphic swooshes
* vortex shapes

Introduce natural variation:

* slightly denser particle regions
* more open gaps
* small deviations
* isolated particles escaping the main path
* subtle directional changes
* realistic variation in particle orientation

The flow should communicate natural efficiency rather than spectacle.

TRUE THREE-DIMENSIONAL DEPTH

Particle depth variation is mandatory.

Create at least three natural depth behaviours:

FOREGROUND PARTICLES:
A small number of botanical fragments relatively close to camera.
They may appear slightly larger, softly defocused and show subtle realistic motion blur.

SUBJECT-PLANE PARTICLES:
The most readable part of the airflow.
Small and delicate particles moving near or around the person's spatial plane.
These particles should have believable sharpness consistent with the lens depth of field.

BACKGROUND PARTICLES:
Very small, sparse botanical fragments continuing into the distant scene.
They should become progressively smaller, softer and less contrasty due to distance and atmospheric perspective.

The differences in scale, focus, contrast and movement must make the airflow genuinely three-dimensional.

The particles must obey the SAME:
light direction,
depth of field,
camera exposure,
motion behaviour,
colour system,
atmospheric perspective

as the rest of the photograph.

INTERACTION WITH THE SUBJECT

The airflow may naturally curve around the person.

Some particles may pass:

* beside the head
* near the shoulders
* partially in front of clothing
* across lower torso areas
* through lateral parts of the frame

but the face must remain clean and clearly readable.

Do not create a dense particle layer directly over:
eyes,
nose,
mouth,
important facial features.

Do not create the impression that particles have been painted over the final photograph.

Where particles pass in front of clothing or body areas, depth and focus must make their physical position believable.

The subject remains the protagonist.

The airflow supports the concept of NATURALEZA EFICIENTE; it never becomes the main character.

PHOTOGRAPHIC CHARACTER

High-end Scandinavian lifestyle editorial photography.

Human.
Natural.
Contemporary.
Elegant.
Restrained.
Premium.
Quietly sophisticated.
Luminous.
Emotionally believable.

Real skin texture.
Visible natural pores.
Real hair.
Believable textile fibres.
Natural garment folds.
Moderate contrast.
Soft highlight rolloff.
Detailed shadows.
Contained colour.

No HDR.
No plastic skin.
No excessive skin smoothing.
No synthetic hyper-sharpness.
No artificial cinematic grading.
No generic stock-photo aesthetic.

CRITICAL INTEGRATION RULE

Before finalising the image, visually treat the PERSON, LANDSCAPE and AIRBORNE BOTANICAL PARTICLES as ONE SINGLE PHOTOGRAPHIC LIGHTING AND CAMERA PROBLEM.

The landscape must illuminate the person.

The daylight must modify the original webcam appearance of the person.

The particles must receive exactly the same environmental light.

The particles must exist at believable distances from the lens and subject.

The subject must cast and receive light consistently with the terrain and atmosphere.

Hair, skin, clothing, accessories, vegetation and particles must all respond to the same physical environment.

There must be NO evidence that:

* the person was cut from another photograph
* the landscape was added afterwards
* the particles were added as an overlay

If necessary, regenerate the visual appearance of the person's skin, hair and clothing under the new daylight while preserving exact identity, wardrobe, pose and recognisable features.

FINAL IMAGE MUST PASS THIS TEST:

It should be impossible to visually identify where the original webcam photograph ends and the generated environment begins.

It should also be impossible to identify the botanical airflow as a separate graphic layer.

Everything must feel captured simultaneously by one real camera in one real location.

NEGATIVE CONSTRAINTS

Do not create:
text,
logos,
Volvo branding,
graphics,
frames,
interfaces,
cars,
vehicles,
roads,
buildings,
urban furniture,
visible studio equipment,
extra people,
collage,
diptych,
multiple panels,
graphic particles,
glowing particles,
magical effects,
confetti,
butterflies,
sparkles,
CGI ribbons,
perfect particle circles,
perfect spirals.

Reject any result where:

* identity changes
* clothing changes materially
* pose changes unnecessarily
* original webcam lighting remains visible
* subject has a cutout edge or halo
* subject and environment have different white balance
* subject looks pasted into the landscape
* particles look like an overlay
* particles look digitally generated
* particles form a perfect geometric shape
* particles obscure the face
* foreground and background particles have identical sharpness
* landscape becomes excessively dramatic
* colour becomes excessively saturated
* image feels like generic stock advertising
* skin becomes artificial
* anatomy or hands become deformed
* the original person's energy is lost

Output only the final photographic image.

`,
);

export const RESPETUOSA_PROMPT = withLookAccuracy(
  'RESPETUOSA',
  `Generate exactly ONE single photographic image.

Create a vertical 4:5 premium lifestyle editorial photograph inspired by the restrained, human and sophisticated visual language of a contemporary Volvo campaign.

Use the attached webcam photograph as the primary reference for the real person or people.

IMPORTANT:
Do NOT treat the source photograph as a cutout to paste onto a new background.

RE-PHOTOGRAPH the same person or people as if they had genuinely been physically present in the new forest environment when the photograph was taken.

The final image must look like ONE REAL CAMERA EXPOSURE, not a background replacement, collage, composite or layered image.

IDENTITY AND CONTENT PRESERVATION

Preserve the exact identity of every real person in the reference:

* recognisable facial structure
* age
* skin tone
* natural skin characteristics
* hairstyle
* facial hair
* glasses
* tattoos
* piercings
* makeup
* accessories
* hats or headwear
* bracelets
* necklaces
* festival accessories
* visible personal objects or drinks
* clothing
* clothing materials
* clothing colours and patterns
* original facial expression
* direction of gaze
* head position
* original pose logic
* gestures
* body direction
* relationship and social energy between people

Preserve exactly the same number of people shown in the source photograph.

Never add, remove, duplicate, replace, merge or omit a person.

The person's identity, wardrobe, expression and pose must remain faithful to the source.

Do not redesign the wardrobe.
Do not neutralise colourful clothes.
Do not replace bright garments with beige editorial garments.
Do not remove personal or festival identity codes unnecessarily.
Do not turn the person into a generic fashion model.
Do not unnecessarily beautify, restyle or curate away their personality.

Only allow minimal corrective cleanup if genuinely necessary:

* obvious anatomy errors
* malformed fingers
* impossible fabric folds
* minor realism corrections

But do not change the user's essence.

However, the SUBJECT MUST BE PHOTOGRAPHICALLY RE-RENDERED to belong naturally to the new environment.

ENVIRONMENTAL RELIGHTING IS REQUIRED.

Do not preserve the original webcam lighting.

Replace the original source lighting with physically believable late golden-hour forest light.

The environment must affect the person naturally:

* soft directional golden-hour light according to the actual forest lighting direction
* natural sky fill in shadow areas
* restrained warm side light or backlight on skin, hair and clothing
* subtle cooler ambient forest fill where appropriate
* realistic light falloff across the face and body
* believable body and contact shadows
* environmental greens, browns and warm tones subtly reflected onto skin and fabric
* realistic light interaction with individual hair strands
* natural translucency on ears and skin where physically appropriate
* clothing materials responding naturally to filtered woodland light
* original webcam colour casts must disappear
* original artificial indoor highlights must disappear
* eliminate any visible masking edges, halos or cutout contours

The person must not look brighter, flatter, sharper, warmer or more contrasty than the surrounding forest.

MATCH THE SUBJECT TO THE SCENE:
same white balance,
same exposure,
same contrast,
same shadow softness,
same highlight rolloff,
same atmospheric perspective,
same optical sharpness,
same depth of field,
same photographic grain.

The result must look as though the camera, the person, the forest, the mossy rock and the creature were all physically present together.

COMPOSITION

The people must remain the principal visual element.

For ONE person:
create a medium editorial portrait with the user as the clear protagonist.

For TWO people:
preserve their relationship, spacing and shared pose logic.

For THREE people:
preserve the group structure, relative positions and social energy.

For FOUR people:
preserve the original arrangement, relative spacing and lively group dynamics.

Do not force people into an artificial symmetrical row.

Do not calm or redesign expressive poses unnecessarily.

Keep all faces naturally visible and recognisable.

Preserve the source pose logic as faithfully as possible.

Allow enough environment around the subject so the creature and the mossy rock are clearly visible.

The creature must be visible without pushing the people into the background.

UPPER-RIGHT GRAPHIC SAFE AREA

Reserve a relatively calm area in the UPPER-RIGHT quadrant for future WHITE graphic placement.

Because the future graphic will be white, this upper-right area must NOT contain:

* white sky
* overexposed highlights
* bright sun patches
* faces
* important hands
* bright clothing details
* the creature
* highly luminous vegetation

Instead, use a medium-to-dark natural forest background made from:

* soft vegetation
* blurred trunks
* shaded foliage
* natural forest shadows

Keep this area visually calm, low-detail and fairly uniform.

Do NOT create a large bright clearing or open white sky in this zone.

Camera approximately at eye level.

Natural portrait lens perspective, approximately equivalent to 50–70 mm full frame.

Moderate depth of field.

Avoid exaggerated telephoto compression or extremely shallow artificial portrait blur.

RESPETUOSA — ENVIRONMENT

Place the person or people at the edge of a real forest or in a quiet wooded rocky setting.

Environment:

* authentic tree trunks
* natural undergrowth
* mossy rocks
* subtle roots
* restrained forest vegetation
* scattered leaves
* natural soil
* soft distant woodland depth
* believable open patches between trees
* a quiet natural atmosphere

The forest must feel REAL.

Avoid:
enchanted-forest clichés,
fantasy vegetation,
glowing plants,
magical light beams,
storybook scenery,
synthetic forest assets.

Emotional tone:
respectful,
precious,
intimate,
coexistence-based,
tender,
quietly magical,
slightly wondrous,
human,
calm.

The sense of wonder must come from discovering the creature within a believable natural world, not from exaggerated fantasy effects.

LIGHTING

Use late golden-hour forest light.

The light should feel:
warm but restrained,
soft,
natural,
filtered through trees,
emotionally inviting,
photographically plausible.

Use:

* subtle warm side light or backlight
* soft neutral ambient woodland fill
* gentle tonal separation between subject and background
* moderate contrast
* soft highlight rolloff
* detailed shadows
* believable patches of light filtered through leaves

Avoid:
dramatic fantasy beams,
visible artificial rays,
deep orange sunset grading,
overexposure,
harsh sunlight,
HDR,
excessive saturation,
cinematic teal-and-orange grading.

The golden-hour warmth should support the photograph, not dominate it.

POETIC ACCENT — ONE SMALL WINGED FOREST CREATURE

Use exactly ONE creature.

Create one small, elegant, photographically plausible winged forest animal.

It may evoke a tiny dragon-like or lizard-like unknown species, but it must feel biologically plausible and physically real.

It must NOT look like:

* a fantasy character
* a pet
* a mascot
* a toy
* a figurine
* a collectible
* a CGI model
* a game creature
* a miniature dinosaur
* a bat
* a winged rat
* a naked lizard with added wings

The creature should feel like a rare forest species that a wildlife photographer could plausibly discover.

CREATURE PLACEMENT

Place the creature naturally on ONE moss-covered rock or natural root located in the foreground or lower-middle part of the composition.

The creature must:

* be clearly visible within approximately two seconds
* have a readable silhouette
* be small relative to the people
* remain clearly legible
* occupy a believable physical scale
* have enough tonal separation from moss and rock
* never become visually dominant over the people

Use subtle natural edge light, side light or tonal contrast if necessary so the creature does not disappear into the moss.

Do NOT artificially spotlight the animal.

The creature should look discovered, not staged.

It should feel as if the photographer took the portrait and happened to capture this rare animal in the same moment.

ANIMAL SCALE

The creature must be genuinely small.

Think approximately the scale of a small woodland reptile or compact bird-sized animal.

It should feel precious because it is small and rare.

Do NOT make it:
large,
imposing,
heroic,
human-sized,
dog-sized,
dragon-sized.

The people remain the protagonists.

BIOLOGICALLY PLAUSIBLE ANATOMY

Construct the animal like a REAL UNKNOWN FOREST SPECIES.

Body:

* small lightweight quadrupedal anatomy
* believable center of gravity
* natural body weight
* functional joints
* subtle musculature beneath the skin
* slender neck
* compact torso
* small expressive head
* gently elongated snout
* appropriately proportioned eyes
* small functional feet
* slender toes
* long flexible tail
* two biologically integrated wings

The wings must feel structurally connected to the skeleton and torso.

Do not simply attach decorative wings onto a lizard body.

The anatomy should suggest that the animal could genuinely move, climb, balance and potentially glide or fly.

HEAD AND EXPRESSION

The animal should have a calm, observant presence.

Do not humanise its expression.

Do not make it smile.

Do not give it exaggerated curiosity or emotion.

Keep:

* subtle natural alertness
* relaxed body posture
* believable animal behaviour
* a quiet sense of coexistence with the people nearby

EYES

Eyes must be:
small,
moist,
alive,
anatomically proportionate.

They may contain tiny reflections of the actual forest environment.

Never use:
large character eyes,
oversized pupils,
cute toy eyes,
Disney-like eyes,
glowing eyes,
fantasy irises.

SKIN — NATURAL LIVING MATERIAL

The creature's skin must possess the irregular complexity of real living animal skin.

Do NOT create one uniform repetitive scale texture.

Combine subtly:

* very small irregular organic scales
* smoother skin around neck, abdomen and joints
* tiny natural folds where skin bends
* subtle differences in thickness
* slight pigmentation variation
* small natural markings
* tiny imperfections
* restrained dry areas
* predominantly matte surface response

The animal should resemble an unknown small forest reptile when seen close up.

From normal portrait distance, the skin should feel visually smooth and coherent rather than aggressively detailed.

Avoid:
large repetitive scales,
crocodile texture,
dinosaur texture,
armor plates,
perfect procedural scale grids,
overly sculpted skin.

MATERIAL RESPONSE

The skin must react to light exactly like living biological tissue.

Use:

* very soft irregular highlights
* restrained matte response
* small shadows inside folds
* subtle micro-roughness
* natural tonal variation caused by body orientation

Never create:
glossy skin,
wet rubber,
vinyl,
wax,
plastic,
resin,
metallic surfaces,
varnish,
molded texture.

The animal must NEVER look manufactured.

WINGS — AUTHENTIC BIOLOGICAL STRUCTURE

Create two delicate wings with anatomically integrated support structures.

Build them from:

* very fine biological skeletal supports
* extremely thin living membrane
* subtle structural tension
* slight folds
* small irregularities
* slightly uneven natural edges

The membrane may contain extremely subtle natural veins visible only where light catches them.

The wings must not resemble insect wings.

They should feel closer to extremely fine reptilian or membranous vertebrate anatomy.

PARTIAL TRANSLUCENCY

When warm forest backlight reaches the thinnest parts of the membrane, those areas may become PARTIALLY TRANSLUCENT.

This must be subtle and physically motivated.

Different regions should have different thickness:

* thicker areas remain mostly opaque
* thinner regions transmit a small amount of warm light
* subtle internal structure may become visible only under backlight

Never use:
uniform transparency,
glass wings,
cellophane,
plastic membrane,
fairy wings,
glowing membrane,
iridescent fantasy material.

The wings must remain biological.

COLOR PALETTE

Use a restrained natural forest palette:

* warm grey
* earthy brown
* muted olive
* restrained beige
* subtle amber
* very soft natural pigmentation variation

Colours should help the animal belong naturally among:
stone,
bark,
moss,
soil,
forest vegetation.

Avoid:
saturated green,
bright blue,
purple,
red fantasy accents,
neon colours,
iridescence,
metallic colour.

The creature must look rare because of its anatomy, not because of artificial colour.

PHYSICAL CONTACT WITH THE ROCK

The creature physically occupies the moss-covered surface.

Its body must have believable weight.

Feet must rest firmly on the rock.

Toes should:

* follow the uneven surface
* adapt naturally to moss and stone
* partly disappear behind small moss structures where appropriate

Include:

* realistic contact shadow beneath feet and body
* subtle occlusion where the animal touches moss
* slight compression or visual interaction with soft moss if physically appropriate

Never:
float the creature,
leave a visible gap beneath feet,
place it on a perfectly clean isolated platform.

The animal, moss and rock must physically interact.

OPTICAL INTEGRATION OF THE CREATURE

This is CRITICAL.

The creature must share exactly the same photographic world as the people and forest.

Match:

* light direction
* light softness
* colour temperature
* exposure
* contrast
* black level
* highlight rolloff
* depth of field
* optical blur
* atmospheric perspective
* photographic grain
* lens rendering

The creature must NOT be:
sharper,
more detailed,
more contrasty,
more saturated,
more perfectly illuminated

than the moss and rock on the same focal plane.

If the rock is slightly outside the primary focus plane, the creature must exhibit exactly the same natural optical softness.

Do not preserve perfect creature detail if the camera optics would not preserve it.

Photographic plausibility is more important than showing every texture.

CREATURE-LIGHT INTERACTION

The same late golden-hour forest light affecting the person must affect the animal.

Warm side or backlight may:

* softly outline parts of its silhouette
* reveal a little wing membrane structure
* create subtle skin highlights
* softly illuminate one side of the head or body

Ambient woodland light must naturally fill shadow areas.

Do not independently light the creature.

There is only ONE environmental lighting system.

RELATIONSHIP BETWEEN PEOPLE AND CREATURE

The creature should feel naturally present in the environment near the people.

The people do NOT need to react to it unless their existing pose and gaze naturally allow it.

Do not change the user's original expression or pose merely to make them look at the animal.

Do not turn the image into a narrative fantasy encounter.

The respectful quality comes from quiet coexistence.

Human and animal simply occupy the same natural world.

The creature must not touch, climb onto or interact physically with the people.

Keep the relationship subtle and observational.

PHOTOGRAPHIC CHARACTER

High-end Scandinavian lifestyle editorial photography.

Human.
Natural.
Contemporary.
Elegant.
Restrained.
Warm.
Quietly sophisticated.
Emotional.
Slightly poetic.
Highly realistic.
Clean.
Never loud.

Real skin texture.
Visible natural pores.
Real hair.
Believable textile fibres.
Natural garment folds.
Moderate contrast.
Soft highlight rolloff.
Detailed shadows.
Subdued colour.
Natural photographic micro-detail.

No HDR.
No plastic skin.
No excessive skin smoothing.
No hyper-sharpening.
No artificial cinematic colour grading.
No generic stock-photo aesthetic.

CRITICAL INTEGRATION RULE

Before finalising the image, visually treat the PEOPLE, FOREST, ROCK, MOSS and CREATURE as ONE SINGLE PHOTOGRAPHIC LIGHTING AND CAMERA PROBLEM.

The forest must illuminate the people.

The natural forest light must replace the original webcam lighting.

The same forest light must illuminate the creature.

The creature must cast and receive physically coherent light.

The animal must physically touch the rock.

The rock must physically belong to the forest floor.

The moss must share the same moisture, light and colour conditions as the rest of the vegetation.

Hair, skin, clothing, accessories, bark, leaves, moss, stone and animal skin must all respond to the same environment.

There must be NO evidence that:

* the person was cut from another photograph
* the forest was added afterwards
* the rock was inserted
* the animal was rendered separately
* the creature is an overlay
* the creature is a 3D asset

If necessary, regenerate the visual appearance of the person's skin, hair and clothing under the new forest lighting while preserving exact identity, wardrobe, expression, pose and recognisable features.

If necessary, reduce creature detail to match the optical realism of its focal plane.

FINAL IMAGE MUST PASS THIS TEST:

It should be impossible to visually identify where the original webcam photograph ends and the generated forest begins.

It should also be impossible to identify the creature as a separate generated or CGI element.

The final photograph should feel like a real portrait captured in a genuine woodland location where a rare unknown animal happened to be present.

BELIEVABLE, NOT SPECTACULAR.

NEGATIVE CONSTRAINTS

Do not create:
text,
logos,
Volvo branding,
graphics,
frames,
interfaces,
cars,
vehicles,
roads,
buildings,
urban furniture,
visible studio lights,
festival structures,
cables,
extra people,
collage,
diptych,
multiple panels,
multiple creatures,
giant creatures,
dragons in flight,
fantasy beams,
glowing plants,
glowing eyes,
glowing wings,
magical particles,
fantasy haze,
fairy wings,
transparent glass wings,
plastic creature skin,
rubber creature skin,
vinyl skin,
resin,
collectible figurine,
toy creature,
video-game creature,
cartoon creature,
character-style creature,
dinosaur texture,
crocodile skin,
large repeated scales,
armour plating,
overly detailed procedural skin.

Reject any result where:

* identity changes
* clothing changes materially
* expression or pose changes unnecessarily
* original webcam lighting remains visible
* subject has a cutout edge or halo
* subject and environment have different white balance
* subject looks pasted into the forest
* creature is too small to understand
* creature becomes too large or dominant
* creature looks cartoonish
* creature looks cute or domestic
* creature looks like a toy
* creature looks CGI
* creature looks sharper than its rock
* creature has independent lighting
* creature floats above the rock
* feet fail to make physical contact
* skin appears plastic or glossy
* wings appear like glass or fairy wings
* creature disappears completely into moss
* forest looks synthetic
* forest becomes overt fantasy
* upper-right graphic area becomes bright or overexposed
* image feels like generic stock advertising
* skin becomes artificial
* anatomy or hands become deformed
* the original person's energy is lost

Output only the final photographic image.
`,
);

export const CONSCIENTE_PROMPT = withLookAccuracy(
  'CONSCIENTE',
  `Generate exactly ONE single photographic image.

Create a vertical 4:5 premium lifestyle editorial photograph inspired by the restrained, human and sophisticated visual language of a contemporary Volvo campaign.

Use the attached webcam photograph as the primary reference for the real person or people.

IMPORTANT:

Do NOT treat the source photograph as a cutout placed onto a dark or nighttime background.

RE-PHOTOGRAPH the same person or people as if they had genuinely been standing outdoors during the FINAL MINUTES OF SUNSET, just as daylight transitions into blue-hour twilight.

THIS IS DUSK, NOT NIGHT.

The environment may already feel deep, blue and slightly nocturnal, but there must still be enough REAL NATURAL SKY LIGHT to illuminate the people beautifully and believably.

The final image must look like ONE REAL CAMERA EXPOSURE.

IDENTITY AND CONTENT PRESERVATION

Preserve the exact identity of every real person in the reference:

* recognisable facial structure
* age
* skin tone
* natural skin characteristics
* hairstyle
* facial hair
* glasses
* tattoos
* piercings
* makeup
* accessories
* hats or headwear
* bracelets
* necklaces
* festival accessories
* visible personal objects or drinks
* clothing
* clothing materials
* clothing colours and patterns
* original facial expression
* direction of gaze
* head position
* original pose logic
* gestures
* body direction
* relationship and social energy between people

Preserve exactly the same number of people shown in the source photograph.

Never add, remove, duplicate, replace, merge or omit anyone.

The person's identity, wardrobe, expression and pose must remain faithful to the source.

Do not redesign the wardrobe.
Do not neutralise colourful clothes.
Do not replace bright garments with beige editorial clothing.
Do not remove personal identity codes.
Do not turn the people into generic fashion models.
Do not unnecessarily beautify or restyle them.

However:

PRESERVE THE PERSON, NOT THE ORIGINAL WEBCAM LIGHTING.

The person must be PHOTOGRAPHICALLY RE-RENDERED under the new outdoor dusk illumination.

Do not preserve original webcam pixels if doing so creates inconsistent lighting.

DUSK RELIGHTING — CRITICAL

Completely remove the original webcam or indoor lighting.

Re-light the person using the NATURAL LIGHT THAT STILL EXISTS AT THE END OF SUNSET.

The person must NOT become excessively dark.

Do NOT expose the subject as though it were nighttime.

The photograph should be exposed primarily for natural-looking skin while allowing the landscape behind the person to fall naturally into darker twilight values.

Think of a professionally exposed environmental portrait captured approximately 5–15 minutes after sunset.

The sun itself is no longer visible as a strong source, but the sky still produces abundant soft natural illumination.

Use TWO NATURAL COMPONENTS OF THE SAME OUTDOOR LIGHT:

1. SOFT COOL OPEN-SKY FILL
   A broad, soft blue-grey skylight illuminating the people naturally from the open sky.

This provides:

* readable facial structure
* soft shadow detail
* natural skin exposure
* subtle cool environmental influence
* soft illumination across clothing

2. RESIDUAL WARM SUNSET LIGHT
   A restrained remaining warm glow from the horizon.

This may gently affect:

* one side of the face
* cheekbones
* forehead
* shoulders
* arms
* individual hair strands
* garment edges

This warm component must feel like residual sunset light from the sky, NOT like an artificial lamp.

The combination should create a natural warm/cool transition:

slightly warm skin highlights
+
cooler soft twilight shadows.

This warm/cool relationship is essential.

SUBJECT EXPOSURE — VERY IMPORTANT

The people should remain clearly readable.

Faces must have enough natural exposure to preserve:

* identity
* skin tone
* expression
* eyes
* facial structure

Do NOT make the face as dark as the deepest forest shadows.

Do NOT bury the people in blue darkness.

Do NOT require every part of the subject to match the background luminance.

A real portrait photographer can expose naturally for the people while allowing the background to become darker.

The subject may be approximately 1 to 1.5 stops brighter than the deepest surrounding vegetation.

THIS DIFFERENCE IS NATURAL AND DESIRABLE.

However, the subject must still share the same:

* colour environment
* shadow softness
* atmospheric conditions
* camera exposure
* lens behaviour

The person should be luminous enough to read, but never look separately illuminated.

NO ARTIFICIAL LIGHTING

Do not create:
flash,
beauty light,
studio key light,
LED light,
cinematic spotlight,
artificial frontal fill,
strong rim light,
festival lighting.

There is no hidden artificial lamp illuminating the person.

The illumination comes entirely from:

* residual sunset sky
* open twilight sky
* natural environmental bounce.

The result must feel achievable with available light.

SKIN AT DUSK

Skin must remain warm and alive.

Do NOT turn skin blue.

Do NOT neutralise skin into grey.

Do NOT make the subject pale or ghostly.

Use:

* natural skin tones
* very subtle warm sunset influence
* cool shadow modulation
* restrained saturation
* soft highlight rolloff
* moderate natural contrast
* believable skin micro-detail

The blue atmosphere should influence the shadows and environment more strongly than the illuminated skin.

The subject belongs to a blue-hour environment without becoming blue.

HAIR AND CLOTHING

Hair must interact naturally with dusk lighting.

Fine hair edges may catch subtle residual warm sky light.

Shadowed hair may merge naturally into darker values, but the overall hairstyle must remain readable.

Clothing should receive the same warm/cool light transition.

Bright garments should remain recognisable but slightly subdued by twilight.

Dark clothing may lose some detail in deeper shadows while still retaining believable textile information.

Do NOT preserve bright indoor highlights from the webcam image.

MATCH PERSON AND ENVIRONMENT IN:

white balance,
shadow colour,
highlight softness,
contrast behaviour,
atmospheric perspective,
depth of field,
optical sharpness,
grain,
sensor response,
black level.

But DO NOT force identical brightness.

The people are the photographic subject and may naturally be exposed slightly brighter than the background.

COMPOSITION

The people remain the main visual element.

For ONE person:
create a medium editorial portrait with the user clearly dominant in the composition.

For TWO people:
preserve their relationship, spacing and shared pose logic.

For THREE people:
preserve the group structure, relative positions and social energy.

For FOUR people:
preserve the original arrangement and natural group dynamics.

Do not create an artificial symmetrical row.

Preserve the original bodily attitude.

Keep enough surrounding environment for the twilight atmosphere and fireflies to be visible.

The composition should breathe.

Do not fill every part of the background with trees or vegetation.

Camera approximately at eye level.

Natural portrait lens perspective equivalent to approximately 50–70 mm full frame.

Moderate depth of field.

Natural photographic separation between subject and background.

Avoid extremely shallow artificial blur.

CONSCIENTE — ENVIRONMENT

Place the person or people in a quiet natural landscape at the END OF SUNSET / BEGINNING OF CIVIL TWILIGHT.

Possible locations:

* calm lakeside edge
* natural meadow
* open woodland clearing
* quiet grassy field bordered by distant trees

The landscape should include:

* natural grasses
* restrained vegetation
* distant tree silhouettes
* readable forest depth
* open sky
* subtle terrain
* atmospheric distance

The environment must already feel slightly nocturnal while still retaining natural sunset illumination.

IMPORTANT SKY CONDITION

Maintain a visible dusk gradient.

The sky should contain:

UPPER SKY:
deep restrained blue.

MIDDLE SKY:
blue-grey twilight.

LOW HORIZON:
a subtle remaining band of warm peach, muted orange, dusty pink or warm neutral sunset light.

The warm horizon should remain restrained.

Do NOT create:
bright golden sunset,
visible dramatic sun,
orange sky everywhere,
epic clouds,
deep black night.

This remaining warm horizon is essential because it justifies the natural warmth still visible on the people.

The viewer should immediately understand:

“daylight is disappearing, but it is not fully night yet.”

BACKGROUND EXPOSURE

The background should become darker than the people, but it must NOT become black.

Retain visible information in:

* grasses
* lake edge
* tree trunks
* tree silhouettes
* foliage masses

The darkest forest areas can approach deep blue-black values but must preserve subtle tonal variation.

Do NOT create a featureless black forest wall.

Do NOT crush the background shadows.

Allow the eye to perceive the environment naturally.

EMOTIONAL TONE

Aware.
Perceptive.
Intimate.
Observant.
Human.
Connected.
Quietly luminous.
Calm.
Softly suspended.

The image should feel like a brief, beautiful transition between day and night.

Not fully daytime.

Not fully nighttime.

Not mysterious fantasy.

Not a festival.

Not a party.

POETIC ACCENT — REAL FIREFLIES

Use exactly ONE poetic accent:

A sparse presence of real fireflies beginning to appear naturally as daylight fades.

The timing is important:

The environment is dark enough for their warm bioluminescence to become visible, but the sky still retains enough natural twilight to illuminate the people.

Create:

* TWO or THREE clearly readable hero fireflies
* several softer secondary fireflies at different depths

Do NOT create a swarm.

Do NOT cover the whole scene with lights.

FIREFLY APPEARANCE

Each firefly should read mainly as a tiny living warm point of light.

Use:

* very small golden-yellow luminous core
* soft natural optical bloom
* delicate halo
* restrained intensity

Do NOT clearly depict insect anatomy.

Do NOT show:

* legs
* wings
* macro insect bodies

Do NOT create:
stars,
LEDs,
Christmas lights,
sparks,
embers,
glitter,
magic dust,
fantasy orbs,
large bokeh circles.

The fireflies must be visually distinct from stars because they exist at different three-dimensional depths inside the landscape.

FIREFLY DEPTH

Create real spatial variation.

NEARER FIREFLIES:
A very small number may appear slightly larger and softer.

MIDGROUND HERO FIREFLIES:
The most readable lights.

Small, warm and naturally defined.

BACKGROUND FIREFLIES:
Smaller, dimmer and softer.

Allow atmospheric perspective to reduce their contrast.

Never make every firefly identical.

Never distribute them evenly.

FIREFLY DISTRIBUTION

Keep the lights irregular and sparse.

Create natural empty spaces.

Avoid:
symmetry,
grids,
circles,
perfect arcs,
decorative arrangements.

The image should feel as though a few insects have naturally begun to appear as daylight fades.

FIREFLIES MUST NOT LIGHT THE PEOPLE

The fireflies must NOT function as lamps.

They do not illuminate:
faces,
large clothing areas,
the landscape,
trees.

Their light is primarily perceived by the camera as tiny points of bioluminescence.

Do not use fireflies as an excuse to artificially relight the subject.

The people are illuminated exclusively by remaining natural dusk light.

LOW-LIGHT / DUSK CAMERA BEHAVIOUR

This is NOT deep-night photography.

Avoid the visual behaviour of a high-ISO midnight photograph.

Use:

* clean but natural image quality
* subtle fine grain
* moderate shadow detail
* natural colour separation
* soft optical transitions
* controlled highlight bloom
* good skin detail
* restrained dynamic range

The image should feel captured before available light becomes too weak.

Do NOT introduce excessive:
noise,
grain,
shadow crushing,
muddy colour,
loss of facial detail.

PHOTOGRAPHIC CHARACTER

High-end Scandinavian lifestyle editorial photography.

Human.
Natural.
Contemporary.
Elegant.
Restrained.
Intimate.
Quietly sophisticated.
Emotionally connected.
Slightly poetic.
Highly realistic.
Clean.
Never loud.

Real skin texture.
Natural hair.
Believable textile fibres.
Moderate contrast.
Soft highlights.
Readable shadows.
Subdued colour.
Natural photographic micro-detail.

NO HDR.
NO hyper-sharpening.
NO plastic skin.
NO excessive skin smoothing.
NO artificial cinematic grading.
NO generic stock-photo night look.

CRITICAL INTEGRATION RULE

Before finalising the image, treat the PEOPLE, LANDSCAPE, SKY, TWILIGHT and FIREFLIES as ONE SINGLE PHOTOGRAPHIC EXPOSURE.

Do not construct a daylight person and then darken the background.

Do not construct a night landscape and then brighten the person independently.

Instead:

RENDER BOTH FROM THE BEGINNING UNDER THE SAME DUSK LIGHTING CONDITIONS.

The open twilight sky illuminates both:
people
and landscape.

The remaining warm horizon influences both:
skin
hair
vegetation
and distant atmosphere.

The darker landscape naturally receives less open-sky light than the people depending on orientation and material.

This creates natural tonal separation without compositing.

The people should look naturally illuminated because they are standing beneath an open dusk sky, not because a hidden light illuminates them.

CRITICAL SUBJECT-INTEGRATION TEST

The face should be brighter than the darkest background vegetation, BUT:

the face must share the same twilight colour cast,
the same shadow softness,
the same atmospheric mood,
the same lens response,
the same grain,
the same exposure logic.

Avoid both extremes:

WRONG:
bright daytime person pasted over night.

ALSO WRONG:
person so dark that identity and skin disappear.

TARGET:
beautifully readable people naturally illuminated by the final remaining light of sunset, surrounded by an environment already entering blue hour.

REFERENCE LIGHTING LOGIC

Aim for the photographic feeling of:

a portrait made outdoors just after sunset,
with a deep blue upper sky,
a faint warm sunset horizon still visible,
dark but readable natural surroundings,
soft natural warmth remaining on skin,
cool ambient twilight in shadows,
and small fireflies beginning to become visible.

The image should read as:

DUSK WITH EARLY-NIGHT ATMOSPHERE.

NOT NIGHT.

FINAL PHOTOGRAPHIC TEST

Ask:

Could this genuinely have been photographed outdoors without flash during the final minutes of available sunset light?

If YES, keep it.

If the person looks pasted onto a nighttime background, reject it.

If the person becomes too dark, reject it.

If the face looks like it is illuminated by an artificial lamp, reject it.

If the landscape looks like daytime, reject it.

If the sky looks like midnight, reject it.

If the warm horizon is completely absent and the photograph becomes monochromatic blue, reject it.

The desired balance is:

READABLE NATURAL SKIN
+
COOL DARKER ENVIRONMENT
+
SUBTLE WARM HORIZON
+
SPARSE WARM FIREFLIES.

QUIETLY LUMINOUS, NOT MAGICAL.

DUSK, NOT NIGHT.

BELIEVABLE, NOT SPECTACULAR.

NEGATIVE CONSTRAINTS

Do not create:
text,
logos,
Volvo branding,
graphics,
frames,
interfaces,
cars,
vehicles,
roads,
buildings,
urban furniture,
visible studio lighting,
festival structures,
cables,
extra people,
collage,
diptych,
multiple panels,
deep midnight,
black forest,
neon blue,
cyan skin,
flash photography,
beauty lighting,
studio key light,
cinematic spotlight,
strong artificial rim light,
firefly swarm,
giant fireflies,
stars,
LED dots,
Christmas lights,
sparks,
embers,
magic dust,
fantasy orbs,
nightclub lighting,
festival lighting.

Reject any result where:

* identity changes
* clothing changes materially
* expression or pose changes unnecessarily
* original webcam lighting remains visible
* people become excessively dark
* skin becomes blue or grey
* face loses recognisable detail
* person appears lit by flash or studio lighting
* background becomes completely black
* image reads as midnight
* warm sunset horizon disappears completely
* subject and environment have incompatible white balance
* hair has a cutout halo
* person looks pasted into the landscape
* fireflies illuminate the people
* fireflies appear as graphic dots or LEDs
* scene feels like a festival or party
* image becomes overt fantasy
* skin becomes artificial
* anatomy or hands become deformed
* the original person's energy is lost

Output only the final photographic image.`,
);
