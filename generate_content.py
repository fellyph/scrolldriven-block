
content = r'''<!-- wp:paragraph -->
<p>A trip to Portugal is an immersion into a land where history, culture, and nature blend seamlessly. From the sun-drenched beaches of the Algarve to the rugged volcanic landscapes of the Azores, Portugal offers a stunning diversity of scenery.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Wander through Lisbon's historic, tiled streets, where traditional fado music echoes from old neighborhoods. Or explore Porto, the capital of the Douro Valley, the world's oldest wine region.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none","className":"scroll-anim-block scroll-anim-scale-up"} -->
<figure class="wp-block-image size-large scroll-anim-block scroll-anim-scale-up"><img src="https://pub-4517acecab6543f0bc62af2fea95f2b6.r2.dev/cover-image.webp" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Wander through Lisbon's historic, tiled streets, where traditional fado music echoes from old neighborhoods. Or explore Porto, the capital of the Douro Valley, the world's oldest wine region.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"className":"scroll-anim-scale-up scroll-anim-block scroll-anim-fade-in"} -->
<h2 class="wp-block-heading scroll-anim-scale-up scroll-anim-block scroll-anim-fade-in">Cities of Portugal</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Wander through Lisbon's historic, tiled streets, where traditional fado music echoes from old neighborhoods. Or explore Porto, the capital of the Douro Valley, the world's oldest wine region.</p>
<!-- /wp:paragraph -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none","className":"scroll-anim-block scroll-anim-slide-in-right"} -->
<figure class="wp-block-image size-large scroll-anim-block scroll-anim-slide-in-right"><img src="https://pub-4517acecab6543f0bc62af2fea95f2b6.r2.dev/Gemini_Generated_Image_we7iutwe7iutwe7i.webp" alt=""/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"aspectRatio":"1","scale":"cover","sizeSlug":"large","linkDestination":"none","className":"scroll-anim-block scroll-anim-slide-in-up"} -->
<figure class="wp-block-image size-large scroll-anim-block scroll-anim-slide-in-up"><img src="https://pub-4517acecab6543f0bc62af2fea95f2b6.r2.dev/Gemini_Generated_Image_83jl2g83jl2g83jl.webp" alt="" style="aspect-ratio:1;object-fit:cover"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none","className":"scroll-anim-block scroll-anim-slide-in-left"} -->
<figure class="wp-block-image size-large scroll-anim-block scroll-anim-slide-in-left"><img src="https://pub-4517acecab6543f0bc62af2fea95f2b6.r2.dev/Gemini_Generated_Image_pi34y8pi34y8pi34.webp" alt=""/></figure>
<!-- /wp:image --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none","className":"scroll-anim-block scroll-anim-slide-in-right"} -->
<figure class="wp-block-image size-large scroll-anim-block scroll-anim-slide-in-right"><img src="https://pub-4517acecab6543f0bc62af2fea95f2b6.r2.dev/Gemini_Generated_Image_trof06trof06trof.webp" alt=""/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"aspectRatio":"1","scale":"cover","sizeSlug":"large","linkDestination":"none","className":"scroll-anim-slide-in-up scroll-anim-block scroll-anim-slide-in-left"} -->
<figure class="wp-block-image size-large scroll-anim-slide-in-up scroll-anim-block scroll-anim-slide-in-left"><img src="https://pub-4517acecab6543f0bc62af2fea95f2b6.r2.dev/Gemini_Generated_Image_we7iutwe7iutwe7i.webp" alt="" style="aspect-ratio:1;object-fit:cover"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:paragraph -->
<p>Wander through Lisbon's historic, tiled streets, where traditional fado music echoes from old neighborhoods. Or explore Porto, the capital of the Douro Valley, the world's oldest wine region.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Wander through Lisbon's historic, tiled streets, where traditional fado music echoes from old neighborhoods. Or explore Porto, the capital of the Douro Valley, the world's oldest wine region.</p>
<!-- /wp:paragraph -->'''

# Step 1: Escape ' to \' for PHP
# We want the output to contain literal \' for every '
php_content = content.replace("'", "\\'")

# Step 2: Flatten to single line
php_content = php_content.replace("\n", "")

# Step 3: Escape " to \" for JSON
json_content = php_content.replace('"', '\\"')

print(json_content)
