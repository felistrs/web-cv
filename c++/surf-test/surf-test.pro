QT += core
QT -= gui
QT += widgets

TARGET = surf-test
CONFIG += console c++11
CONFIG -= app_bundle

QMAKE_CXXFLAGS_RELEASE *= -O3


TEMPLATE = app

SOURCES += \
    ../code/surf_test.cpp \
    ../../../../lib/dlib/dlib/all/source.cpp


QMAKE_LFLAGS += -pthread

DEFINES += DLIB_NO_GUI_SUPPORT


INCLUDEPATH += \
    ../../../../lib/dlib/

HEADERS += \
    ../code/timer.h \
    ../code/surf_v2.h \
    ../code/hessian_pyramid_v2.h

