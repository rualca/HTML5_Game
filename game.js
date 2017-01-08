/*jslint bitwise:true, es5: true */
(function (window, undefined) {
    'use strict';
    var KEY_ENTER = 13,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,

        canvas = null,
        context = null,
        lastPress = null,
        pause = true,
        gameover = true,
        dir = 0,
        score = 0,
        //wall = [],
        body = [],
        food = null,
        body_image = new Image(),
        food_image = new Image(),
        eat_sound = new Audio(),
        die_sound = new Audio();

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());

    document.addEventListener('keydown', function (evt) {
        lastPress = evt.which;
    }, false);

    function Rectangle(x, y, width, height) {
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;
    }

    Rectangle.prototype = {
        constructor: Rectangle,

        intersects: function (rect) {
            if (rect === undefined) {
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
            }
        },

        fill: function (context) {
            if (context === undefined) {
                window.console.warn('Missing parameters on function fill');
            } else {
                context.fillRect(this.x, this.y, this.width, this.height);
            }
        },

        drawImage: function (context, img) {
            if (img === undefined) {
                window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                    context.drawImage(img, this.x, this.y);
                } else {
                    context.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    };

    function random(max) {
        return ~~(Math.random() * max);
    }

    function canPlayOgg() {
        var aud = new Audio();
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
            return true;
        } else {
            return false;
        }
    }

    function reset() {
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;
    }

    function paint(context) {
        var i = 0,
            l = 0;

        // Clean canvas
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player
        //context.fillStyle = '#0f0';
        context.strokeStyle = '#0f0';
        for (i = 0, l = body.length; i < l; i += 1) {
            //body[i].fill(context);
            body[i].drawImage(context, body_image);
        }

        // Draw food

        context.strokeStyle = '#f00';
        food.drawImage(context, food_image);

        // Debug last key pressed
        context.fillStyle = '#fff';
        //context.fillText('Last Press: ' + lastPress, 0, 20);

        // Draw score
        context.fillText('Score: ' + score, 0, 10);

        // Draw pause
        if (pause) {
            context.textAlign = 'center';
            if (gameover) {
                context.fillText('GAME OVER', 150, 75);
            } else {
                context.fillText('PAUSE', 150, 75);
            }
            context.textAlign = 'left';
        }
    }

    function act() {
        var i = 0,
            l = 0;

        if (!pause) {
            // GameOver Reset
            if (gameover) {
                reset();
            }

            // Move Body
            for (i = body.length - 1; i > 0; i -= 1) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }

            // Change Direction
            if (lastPress === KEY_UP && dir !== 2) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT && dir !== 3) {
                dir = 1;
            }
            if (lastPress === KEY_DOWN && dir !== 0) {
                dir = 2;
            }
            if (lastPress === KEY_LEFT && dir !== 1) {
                dir = 3;
            }

            // Move Head
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
                body[0].x -= 10;
            }

            // Out Screen
            if (body[0].x > canvas.width - body[0].width) {
                body[0].x = 0;
            }
            if (body[0].y > canvas.height - body[0].height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = canvas.width - body[0].width;
            }
            if (body[0].y < 0) {
                body[0].y = canvas.height - body[0].height;
            }

            // Body Intersects
            for (i = 2, l = body.length; i < l; i += 1) {
                if (body[0].intersects(body[i])) {
                    gameover = true;
                    pause = true;
                    die_sound.play();
                }
            }

            // Food Intersects
            if (body[0].intersects(food)) {
                body.push(new Rectangle(food.x, food.y, 10, 10));
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                eat_sound.play();
            }
        }

        // Pause/Unpause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
    }

    function repaint() {
        window.requestAnimationFrame(repaint);
        paint(context);
    }

    function run() {
        setTimeout(run, 100);
        act();
    }

    function init() {
        // Get canvas and context
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        // Load assets
        body_image.src = 'resources/images/body.png';
        food_image.src = 'resources/images/apple.png';
        if (canPlayOgg()) {
            eat_sound.src = 'resources/sounds/eat_sound.ogg';
            die_sound.src = 'resources/sounds/die_sound.ogg';
        } else {
            eat_sound.src = 'resources/chomp.m4a';
            die_sound.src = 'resources/dies.m4a';
        }

        // Create food
        food = new Rectangle(80, 80, 10, 10);

        // Start game
        run();
        repaint();
    }

    window.addEventListener('load', init, false);
}(window));
