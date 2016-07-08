#include <chrono>
#include <iostream>
#include <string>

#include <dlib/image_io.h>
#include <dlib/image_keypoint.h>
#include <dlib/image_transforms.h>

#include "surf_v2.h"


using namespace std;
using namespace dlib;


const string c_image_fname = "image_512.bmp";
const string c_image_fpath = "/home/felistrs/projects/my/web-cv/c++/resources/" + c_image_fname;
const string c_image_fpath_out = "/home/felistrs/projects/my/web-cv/c++/out/" + c_image_fname;

const unsigned c_tests_count = 1000;

//  ----------------------------------------------------------------------------


int main()
{
    try
    {
        // Load
        array2d<rgb_pixel> img;
        load_image(img, c_image_fpath);

        // SURF
        std::vector<surf_point> sp;

        {
            auto t1 = chrono::high_resolution_clock::now();

            size_t tests_n = c_tests_count; //
            for (size_t i = 0; i < tests_n; ++i) {
                //sp = get_surf_points_v2(img);
                sp = get_surf_points(img);
            }

            auto t2 = chrono::high_resolution_clock::now();
            auto d = chrono::duration_cast<chrono::milliseconds>(t2 - t1);

            std::cout << "SURF : " << d.count() / double(tests_n) << " ms" << std::endl;
        }

        cout << "number of SURF points found: "<< sp.size() << endl;

        // Draw
        for (unsigned long i = 0; i < sp.size(); ++i)
        {
            const unsigned long radius = static_cast<unsigned long>(sp[i].p.scale*3);
            const point center(sp[i].p.center);
            point direction = center + point(radius,0);
            direction = rotate_point(center, direction, sp[i].angle);

            draw_solid_circle(img, center, 1.5, rgb_pixel(0, 255, 0));
            draw_line(img, center, direction, rgb_pixel(255, 0, 0));

            cout << "P: " << center.x() << " " << center.y() << "\n";
        }

        // Save
        save_bmp(img, c_image_fpath_out);
    }
    catch (exception& e)
    {
        cout << "exception thrown: " << e.what() << endl;
    }

    return 0;
}
