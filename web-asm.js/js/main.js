var do_surf_algo = function (number) {
    // Read image
    var img = document.getElementById('image_in');
    var img = document.getElementById('image_in');
    
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    var imageData = context.getImageData(0, 0, img.width, img.height);


    // SURF
    var buffer = imageData.data.buffer;

    var start_t = new Date().getTime();

    var sp = null;
    for (var i = 0; i < number; ++i) {
        sp = Module.surf_detect(buffer, imageData.width, imageData.height);
    }

    var finish_t = new Date().getTime();

    var surf_run_ms = (finish_t - start_t) / number;
    console.log("Time speent one run : " + surf_run_ms);


    // Output
    console.log("size : " + sp.size());

    var img_out = document.getElementById('image_out');
    var context_out = img_out.getContext('2d');

    context_out.putImageData(imageData, 0, 0);
    context_out.lineWidth = 1;

    for (var i = 0; i < sp.size(); ++i) {
        var p = sp.get(i);
        //console.log("Point : " + p.x + ", " + p.y + ', ' + p.angle + ', ' + p.radius);
        
        var x1 = p.x + 3 * p.radius * Math.cos(p.angle);
        var y1 = p.y + 3 * p.radius * Math.sin(p.angle);

        context_out.beginPath();
        context_out.strokeStyle = '#f00';
        context_out.moveTo(p.x, p.y);
        context_out.lineTo(x1, y1);
        context_out.stroke();

        context_out.beginPath();
        context_out.strokeStyle = '#0f0';
        context_out.arc(p.x, p.y, 2, 0, 2 * Math.PI, false);
        context_out.stroke();
    }

    document.getElementById('result').innerHTML = "Result: " + surf_run_ms + "ms";

    console.log("DONE.");
}
