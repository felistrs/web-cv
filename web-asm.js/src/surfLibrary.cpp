// # RECOMMENDED READING:
// https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-call-javascript-from-native


#include <stdint.h>

#include "dlib/image_io.h"
#include "dlib/image_keypoint.h"
#include "dlib/image_transforms.h"

#include <emscripten.h>
#include <emscripten/bind.h>



using namespace emscripten;



struct LibraryContext 
{
    int width = 0;
    int height = 0;
    dlib::array2d<dlib::rgb_pixel>* frame_image_data = 0;
};

struct SurfPoint {
	int x = -1;
	int y = -1;
    float radius = 0.0f;
    float angle = -1.0f;
};


static LibraryContext g_context;




int main() {
	EM_ASM( console.log('[C++ Side]: main()'); );
    return 0;
}



void do_clampedArray8_rgba_to_array2d_convertion(const std::string& data, dlib::array2d<dlib::rgb_pixel> &data_o)
{
	unsigned pos = 0;
	unsigned h = data_o.nr();
	unsigned w = data_o.nc();
	for (unsigned y = 0; y < h; y++)
		for (unsigned x = 0; x < w; x++)
		{
			data_o[y][x] = dlib::rgb_pixel(data[pos], data[pos+1], data[pos+2]);
			pos += 4;
		}
}



std::vector<SurfPoint> do_convert_surf_points(const std::vector<dlib::surf_point>& data)
{
	std::vector<SurfPoint> results;

	for (const auto& surf_point : data)
	{
		SurfPoint sp;
        sp.x = surf_point.p.center.x();
        sp.y = surf_point.p.center.y();
        sp.radius = surf_point.p.scale;
        sp.angle = surf_point.angle;
		results.push_back(sp);
	}

	return results;
}



std::vector<SurfPoint> surf_detect(const std::string &rgba_array, unsigned width, unsigned height) 
{
	int error_code = 0;

	if (g_context.frame_image_data == NULL ||
				width != g_context.width ||
				height != g_context.height) 
	{
        if (g_context.frame_image_data) {
    		delete g_context.frame_image_data;
        }
		g_context.frame_image_data = NULL;
		g_context.frame_image_data = new dlib::array2d<dlib::rgb_pixel>(height, width);
		g_context.width = width;
		g_context.height = height;
		EM_ASM(	console.log('[C++ Side]: image recreated'); );
	}

	// Convert Uint8ClampedArray got from imageData to internal dlib format.
	do_clampedArray8_rgba_to_array2d_convertion(rgba_array, *g_context.frame_image_data);

	// Surf
    std::vector<dlib::surf_point> sp = dlib::get_surf_points(*g_context.frame_image_data);


    return do_convert_surf_points(sp);
}



EMSCRIPTEN_BINDINGS(overloads) {

	value_object<SurfPoint>("SurfPoint")
        .field("x", &SurfPoint::x)
        .field("y", &SurfPoint::y)
        .field("radius", &SurfPoint::radius)
        .field("angle", &SurfPoint::angle)
        ;

	register_vector<SurfPoint>("VectorSurfPoint");

    function("surf_detect", &surf_detect );
};


