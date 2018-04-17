// Our awesome gulp!

var gulp = require('gulp'),                        // Gulp
    concatCss = require('gulp-concat-css'),        // Concat css files
    autoprefixer = require('gulp-autoprefixer'),   // Prefix for css (old browser)
    rename = require('gulp-rename'),               // Rename files
    minifyCss = require('gulp-minify-css'),        // Minification css files
    concat = require("gulp-concat"),               // Concat
    uglify = require('gulp-uglify'),	            // Min js
    compass = require('gulp-compass'),				// Compass
    sourcemaps = require('gulp-sourcemaps'),
    path = require('path'),  						// Path
    twig = require('gulp-twig'),
    plumber = require('gulp-plumber');  			// Path

gulp.task('css', function () {
    var files = [
        './web/css/jquery-ui.css',
        './web/css/easy-autocomplete.min.css',
        './web/css/message_popup.css',
        './web/css/jscrollpane.css',
        './web/css/style_sheet.css',
        './web/css/style_add.css',
        './web/css/responsive.css',
        './web/css/animation.css',
        './web/css/fontello.css',
        './web/css/fontello-codes.css',
        './web/css/fontello-embedded.css',
        './web/css/fontello-ie7-codes.css',
        './web/css/fontello-ie7.css',
        './web/css/chosen.css',
        './web/css/main.css',
        './web/css/settings.css',
        './web/css/new_wallet.css',
        './web/css/cities.css',
        './web/css/popup_addinfo.css',
        './web/css/sod_popup.css',
        './web/css/sass_compiled/app.css'
    ];

    var assets = [
        './web/css/chosen.png'
    ];

    gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(concat('style.min.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./web/dist'));

    gulp.src(assets)
        .pipe(gulp.dest('./web/dist'));
});

// Build our js files!
gulp.task('js', function () {
    var files = [
        './app/Resources/public/js/functions.js',
        './app/Resources/public/js/socket.js',
        './app/Resources/public/js/modules/*.js',
        './app/Resources/public/js/*.js',
        './app/Resources/public/js/controllers/*.js'
    ];

    var desktopFiles = [
        // './web/js/jquery.js',
        // './web/js/jquery.selectbox.js',
        // './web/js/picnic_mpage.js',
        // './web/js/chosen.jquery.js',
        // './web/lib/tether/dist/js/tether.min.js',
        './web/lib/drop/dist/js/drop.min.js',
        './web/lib/js-cookie/src/js.cookie.js',

        './web/lib/nanoscroller/jquery.nanoscroller.min.js',
        './web/js/app/bower_components/photoswipe/dist/photoswipe.min.js',
        './web/js/app/bower_components/lodash/lodash.min.js',
        './web/js/app/bower_components/emojione/lib/js/emojione.min.js',
        './web/js/app/bower_components/moment/min/moment-with-locales.min.js',

        // Include angular lib
        './web/js/app/bower_components/angular/angular.min.js',
        './web/js/app/bower_components/angular-route/angular-route.min.js',
        './web/js/app/bower_components/angular-resource/angular-resource.min.js',
        './web/js/app/bower_components/angular-sanitize/angular-sanitize.min.js',
        './web/js/app/bower_components/angular-nanoscroller/scrollable.js',
        './web/js/app/bower_components/ng-dialog/js/ngDialog.min.js',
        './web/js/app/bower_components/ng-file-upload/ng-file-upload-all.min.js',
        './web/js/app/bower_components/angular-socket-io/mock/socket-io.js',
        './web/js/app/bower_components/angular-socket-io/socket.min.js',
        './web/js/app/bower_components/checklist-model/checklist-model.js',
        './web/js/app/bower_components/Sortable/Sortable.js',
        './web/js/app/bower_components/Sortable/ng-sortable.js',

        // Include angular app
        './web/js/app/js/app.js',

        // Service
        './web/js/app/js/dialog/service/dialogService.js',

        // Filter
        './web/js/app/js/dialog/filter/dialogFilter.js',
        './web/js/app/js/user/filter/userFilter.js',
        './web/js/app/js/smile/filter/smileFilter.js',
        './web/js/app/js/blog/filter/blogFilter.js',
        './web/js/app/js/app/filter/appFilter.js',

        // Directive
        './web/js/app/js/app/directive/appDirective.js',
        './web/js/app/js/dialog/directive/dialogDirective.js',
        './web/js/app/js/folder/directive/folderDirective.js',

        // UI
        './web/js/app/js/photoswipe/ui/photoswipe.ui.js',

        // Fatory
        './web/js/app/js/dialog/factory/dialogFactory.js',
        './web/js/app/js/folder/factory/folderFactory.js',
        './web/js/app/js/user/factory/userFactory.js',
        './web/js/app/js/user/factory/toFactory.js',
        './web/js/app/js/gift/factory/giftFactory.js',
        './web/js/app/js/smile/factory/smileFactory.js',
        './web/js/app/js/socket/factory/socketFactory.js',
        './web/js/app/js/photoswipe/factory/photoswipeFactory.js',
        './web/js/app/js/error/factory/appHttpInterceptor.js',
        './web/js/app/js/blog/factory/blogFactory.js',
        './web/js/app/js/adv-message/factory/advMessage.js',

        // Controller
        './web/js/app/js/app/controller/appCtrl.js',
        './web/js/app/js/app/controller/socketCtrl.js',
        './web/js/app/js/dialog/controller/dialogsCtrl.js',
        './web/js/app/js/message/controller/messageCtrl.js',
        './web/js/app/js/gift/controller/giftsCtrl.js',
        './web/js/app/js/smile/controller/smileCtrl.js',
        './web/js/app/js/upload/controller/uploadCtrl.js',
        './web/js/app/js/folder/controller/folderCtrl.js',
        './web/js/app/js/user/controller/toCtrl.js',
        './web/js/app/js/auth/controller/authCtrl.js',
        './web/js/app/js/error/controller/errorCtrl.js',

        // Components
        './web/js/app/js/blog/comment/comment.component.js',
        './web/js/app/js/adv-message/adv-message-list/adv-message-list.component.js',
        './web/js/app/js/adv-message/adv-interest-list/adv-interest-list.component.js',
        './web/js/app/js/component/menu/directive.js'
    ];

    gulp.src(desktopFiles)
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./web/js'));

    gulp.src(files)
    //.pipe(uglify())
        .pipe(concat('index.js'))
        .pipe(gulp.dest('./web/js'));


    // Mobile
    gulp.src([
        './app/Resources/public/m/js/*.js',
        './app/Resources/public/m/js/modules/*.js',
        './app/Resources/public/m/js/controllers/*.js'
    ])
        .pipe(concat('index.js'))
        .pipe(gulp.dest('./web/m/js'));

    gulp.src([
        "./web/js/jquery.touchSwipe.min.js",
        // Bower packages
        "./web/lib/nanoscroller/jquery.nanoscroller.min.js",
        "./web/js/app/bower_components/photoswipe/dist/photoswipe.min.js",
        "./web/js/app/bower_components/photoswipe/dist/photoswipe-ui-default.min.js",
        "./web/js/app/bower_components/lodash/lodash.min.js",
        "./web/js/app/bower_components/emojione/lib/js/emojione.min.js",
        "./web/js/app/bower_components/moment/min/moment-with-locales.min.js",

        // Include angular lib
        "./web/js/app/bower_components/angular/angular.min.js",
        "./web/js/app/bower_components/angular-route/angular-route.min.js",
        "./web/js/app/bower_components/angular-resource/angular-resource.min.js",
        "./web/js/app/bower_components/angular-sanitize/angular-sanitize.min.js",
        "./web/js/app/bower_components/angular-nanoscroller/scrollable.js",
        "./web/js/app/bower_components/ng-dialog/js/ngDialog.min.js",
        "./web/js/app/bower_components/ng-file-upload/ng-file-upload-all.min.js",
        "./web/js/app/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min.js",

        // Include angular app
        "./web/js/app/m/app.js",

        // Service

        // Filter
        "./web/js/app/m/dialog/filter/dialogFilter.js",
        "./web/js/app/m/user/filter/userFilter.js",
        "./web/js/app/m/smile/filter/smileFilter.js",
        "./web/js/app/m/app/filter/appFilter.js",
        "./web/js/app/m/blog/filter/blogFilter.js",

        // Directive
        "./web/js/app/m/app/directive/appDirective.js",
        "./web/js/app/m/app/directive/hoverDirective.js",
        "./web/js/app/m/dialog/directive/dialogDirective.js",
        "./web/js/app/m/folder/directive/folderDirective.js",
        "./web/js/app/m/page/adv_message/directive/advMessageDirective.js",
        // UI
        // "./web/js/app/m/photoswipe/ui/photoswipe.ui.js",

        // Fatory
        "./web/js/app/m/dialog/factory/dialogFactory.js",
        "./web/js/app/m/folder/factory/folderFactory.js",
        "./web/js/app/m/user/factory/userFactory.js",
        "./web/js/app/m/user/factory/toFactory.js",
        "./web/js/app/m/gift/factory/giftFactory.js",
        "./web/js/app/m/smile/factory/smileFactory.js",
        "./web/js/app/m/socket/factory/socketFactory.js",
        "./web/js/app/m/photoswipe/factory/photoswipeFactory.js",
        './web/js/app/m/adv-message/factory/advMessage.js',
        './web/js/app/m/blog/factory/blogFactory.js',


        // Controller
        "./web/js/app/m/app/controller/appCtrl.js",
        "./web/js/app/m/folder/controller/folderCtrl.js",
        "./web/js/app/m/dialog/controller/dialogMainCtrl.js",
        "./web/js/app/m/dialog/controller/dialogCtrl.js",
        "./web/js/app/m/gift/controller/giftsCtrl.js",
        "./web/js/app/m/smile/controller/smileCtrl.js",
        "./web/js/app/m/upload/controller/uploadCtrl.js",
        "./web/js/app/m/dialog/controller/messageCtrl.js",
        "./web/js/app/m/user/controller/toCtrl.js",
        "./web/js/app/m/head/controller/headCtrl.js",
        "./web/js/app/m/page/profile/controller/showKeptCtrl.js",
        "./web/js/app/m/page/adv_message/controller/advMessageCtrl.js",
        "./web/js/app/m/photoswipe/controller/photoswipeCtrl.js",

        // Components
        './web/js/app/m/adv-message/adv-interest-list/adv-interest-list.component.js',
        './web/js/app/m/blog/comment/comment.component.js'
    ])
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./web/m/js'));

});

var sources = {
    mobile: {
        sass: {
            watch: 'web/m/sass/**/*.sass',
            dist: 'web/m/sass/',
            src: 'web/m/sass/*.sass'
        },
        css: {
            dist: 'web/m/css/sass_compiled',
            src: 'web/m/css/*.css'
        },
        images: {
            icons: {
                default: 'web/m/images/icons/*.png',
                retina: 'web/m/images/icons/*@2x.png'
            },
            dist: 'web/m/sass_images'
        }
    },
    sass: {
        watch: 'web/sass/**/*.sass',
        dist: 'web/sass/',
        src: 'web/sass/*.sass'
    },
    css: {
        dist: 'web/css/sass_compiled',
        src: 'web/css/*.css'
    },
    js: {
        dist: 'web/js/',
        src: 'web/js/*.js'
    },
    images: {
        dist: 'web/sass_images'
    }
};

gulp.task('compass', function () {
    gulp.src(sources.sass.watch)
        .pipe(plumber())
        .pipe(compass({
            sass: sources.sass.dist,
            css: sources.css.dist,
            js: sources.js.dist,
            image: sources.images.dist,
            sourcemap: true,
            relative: true
        }))
        .pipe(gulp.dest(sources.css.dist));

    gulp.src(sources.mobile.sass.watch)
        .pipe(plumber())
        .pipe(compass({
            sass: sources.mobile.sass.dist,
            css: sources.mobile.css.dist,
            image: sources.mobile.images.dist,
            sourcemap: true,
            relative: true

        }))
        .pipe(gulp.dest(sources.mobile.css.dist));
});

gulp.task('twig', function () {
    gulp.src('twig/*.twig')
        .pipe(twig({
            data: {
                title: 'Gulp and Twig',
                benefits: [
                    'Fast',
                    'Flexible',
                    'Secure'
                ]
            }
        }))
        .pipe(gulp.dest('./'));
});

// watch
gulp.task('watch', function () {
    gulp.watch(sources.sass.watch, ['compass']);
    gulp.watch('./web/css/**/*.css', ['css']);
    gulp.watch('./web/js/app/**/*.js', ['js']);
    gulp.watch('./twig/**/*.twig', ['twig']);
});

gulp.task('default', ['compass', 'css', 'js', 'twig', 'watch']);
