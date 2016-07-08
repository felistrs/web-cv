#ifndef TIMER
#define TIMER

#include <string>
#include <chrono>


class Timer
{
public:
    Timer(std::string name) :
        _name(name)
    {
        _start = std::chrono::high_resolution_clock::now();
    }

    ~Timer()
    {
        auto finish = std::chrono::high_resolution_clock::now();
        auto d = std::chrono::duration_cast<std::chrono::milliseconds>(finish - _start);
        std::cout << _name <<  " : " << d.count() << " ms" << std::endl;
    }


private:
    std::chrono::high_resolution_clock::time_point _start;
    std::string _name;

};


#endif // TIMER

