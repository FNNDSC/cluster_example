
function C_group(d) {

    var self         = this;

    this.info        = '<void>';
    this.num         = 100;
    this.hue         = 45;               // HSL angle
    this.saturation  = "100%";
    this.lightness   = "50%";
    this.radius      = 10;

    this.svgWidth    = window.innerWidth     * 0.95;
    this.svgHeight   = window.innerHeight    * 0.95;
    this.nodes       = null;

    this.xOffset     = 0;
    this.yOffset     = 0;

    if(!(typeof(d)==='undefined')) {
       this.info            = d.info;
       this.num             = d.num;
       this.hue             = d.hue;
       this.saturation      = d.saturation;
       this.lightness       = d.lightness;
       this.radius          = d.radius;
       this.svgWidth        = d.svgWidth;
       this.svgHeight       = d.svgHeight;
       this.svg             = d.svg;
       this.xOffset         = d.xOffset;
       this.yOffset         = d.yOffset;
    };

    this.points_generate     = function() {
        self.nodes = d3.range(self.num).map(function() {
            return {
               radius:          self.radius,
               cx:              Math.random() * (self.svgWidth-self.xOffset)  - 50 + self.xOffset,
               cy:              Math.random() * (self.svgHeight-self.yOffset) - 50 +
               self.yOffset,
               hue:             self.hue,
               saturation:      self.saturation,
               lightness:       self.lightness
            }
        });
    };

    this.points_recolor      = function(d) {
       f_threshold      = d.randomThreshold;
       for(var i = 0; i < self.nodes.length; i++) {
           if(Math.random() > f_threshold) {
               self.nodes[i].hue        = d.upper.hue;
               self.nodes[i].saturation = d.upper.saturation;
               self.nodes[i].lightness  = d.upper.lightness;
           } else {
               self.nodes[i].hue        = d.lower.hue;
               self.nodes[i].saturation = d.lower.saturation;
               self.nodes[i].lightness  = d.lower.lightness;
           }
       }
       d    = {};
       d.b_colorEachPoint = true;
       self.points_draw(d);
    };

    this.points_restore      = function(d) {
        for(var i = 0; i < self.nodes.length; i++) {
            self.nodes[i].lightness = "50%";
        }
        d    = {};
        d.b_colorEachPoint = true;
        self.points_draw(d);
    };

    this.points_draw     = function(d) {
       b_colorEachPoint = false;
       if(!(typeof(d)==='undefined')) {
           hue              = d.hue;
           saturation       = d.saturation;
           lightness        = d.lightness;
           if(!(typeof(d.b_colorEachPoint)==='undefined'))
               b_colorEachPoint = true;
       } else {
           hue              = self.hue;
           saturation       = self.saturation;
           lightness        = self.lightness;
       }

       // Append each circle in nodes to SVG
       for (var i = 0; i < self.nodes.length; i++) {
           if(b_colorEachPoint) {
               hue          = self.nodes[i].hue;
               saturation   = self.nodes[i].saturation;
               lightness    = self.nodes[i].lightness;
           }
           str_HSL         = "hsl(" + hue + "," + saturation + "," + lightness + ")";
           self.svg.append("circle")
           .attr("cx", self.nodes[i].cx)
           .attr("cy", self.nodes[i].cy)
           .attr("r",  self.nodes[i].radius)
           .attr("fill", function() { return  str_HSL})
           .style("stroke", "black")
           .style("stroke-width", 1);
       }
    }
}

function C_click_handler(d) {
    var self                = this;

    this.count              = 0;
    this.C_gr1              = d.C_gr1;
    this.C_gr2              = d.C_gr2;

    this.a_F_process        = [
        this.F_1,
        this.F_2,
        this.F_3,
        this.F_4
    ];

    this.intraGroup_recolor         = function(C_gr) {
        d                       = {};
        d.randomThreshold       = 0.5;
        d.lower                 = {};
        d.upper                 = {};
        d.lower.hue             = C_gr.hue;
        d.lower.saturation      = C_gr.saturation;
        d.lower.lightness       = "25%";
        d.upper.hue             = C_gr.hue;
        d.upper.saturation      = C_gr.saturation;
        d.upper.lightness       = "75%";
        return d;
    };

    this.intraGroup_colorOnOff  = function(C_gr) {
        d                       = {};
        d.randomThreshold       = 0.5;
        d.lower                 = {};
        d.upper                 = {};
        d.lower.hue             = window.getComputedStyle(document.body, null).backgroundColor;
        d.lower.saturation      = C_gr.saturation;
        d.lower.lightness       = "50%";
        d.upper.hue             = C_gr.hue;
        d.upper.saturation      = C_gr.saturation;
        d.upper.lightness       = "50%";
        return d;
    };

    this.click_process              = function() {

        // The "clicks" are the "timing" events.
        self.count++;
        console.log('Click count = ' + self.count);

        // First clear one of the groups
        if(self.count == 1) {
            self.wholeGroup_clear(self.C_gr1);
        }

        // Now randomly divide the other cloud into two subgroups
        d = {};
        if(self.count > 1 && self.count < 10) {
            self.wholeGroup_recolor(self.C_gr2,
                self.intraGroup_recolor(self.C_gr2));
        }

        // Restore both groups
        if(self.count == 10) {
            self.wholeGroup_restore(self.C_gr1);
            self.wholeGroup_clear(self.C_gr2);
        }

        // Do the same random division on the other group
        if(self.count > 10 && self.count < 20) {
            self.intraGroup_recolor(self.C_gr1, d);
            self.wholeGroup_recolor(self.C_gr1, d);
        }

        // Restore again
        if(self.count == 20) {
            self.wholeGroup_restore(self.C_gr1);
            self.wholeGroup_restore(self.C_gr2);
        }

        // And now divide the two original groups
        if(self.count > 20) {
            self.wholeGroup_recolor(self.C_gr1, self.intraGroup_colorOnOff(self.C_gr1));
            self.wholeGroup_recolor(self.C_gr2, self.intraGroup_colorOnOff(self.C_gr2));
        }
    };

    this.wholeGroup_clear           = function(C_gr) {
        d               = {};
        d.hue           = window.getComputedStyle(document.body, null).backgroundColor;
        d.saturation    = C_gr.saturation;
        d.lightness     = C_gr.lightness;
        C_gr.points_draw(d);
    };

    this.wholeGroup_restore         = function(C_gr) {
        C_gr.points_draw();
    };

    this.wholeGroup_recolor         = function(C_gr) {
        C_gr.points_recolor(d);
    };
}

window.onload = function(e){
    console.log("window.onload", e, Date.now() );

    var d           = {};
    d.num           = 100;
    d.hue           = 45;
    d.saturation    = "100%";
    d.lightness     = "50%";
    d.radius        = 5;
    d.svgWidth      = window.innerWidth     * 0.98;
    d.svgHeight     = window.innerHeight    * 0.97;

    d.svg           = d3.select("body").append("svg")
    .attr("width",  d.svgWidth)
    .attr("height", d.svgHeight);

    d.hue           = 0;
    d.xOffset       = 0;
    d.yOffset       = 0;

    P_grA           = new C_group(d);
    P_grA.points_generate();
    P_grA.points_draw();

    d.hue           = 240;
    d.xOffset       = 500;
    d.yOffset       = 500;
    P_grB           = new C_group(d);
    P_grB.points_generate();
    P_grB.points_draw();

    d               = {};
    d.C_gr1         = P_grA;
    d.C_gr2         = P_grB;
    ch              = new C_click_handler(d);

    document.body.addEventListener('click', ch.click_process);

};
