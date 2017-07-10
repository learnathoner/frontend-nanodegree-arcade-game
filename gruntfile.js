/*
Steps:
1. Terminal: npm init - set name and values
2. Terminal: npm install grunt --save-dev
3. Install packages: npm install grunt-contrib-name --save-dev
4. Congif pkg, add to loadNpmTasks and registerTask
5. Run "grunt" default or "grunt task_name"
Watch Page: Website script: <script src="http://localhost:35729/livereload.js"></script>
*/

// TODO: Check on CSS lint

module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      options: {
        livereload: true,
      },
      siteUpdate: {
        files: ['css/*.css', '*.html', 'js/*.js'],
        tasks: [] //options: htmllint
      },
      jsHint: {
        files: ['js/app.js'],
        tasks: ['jshint']
      }
    },
    htmllint: {
      all: {
        options: {
          ignore: /Section lacks heading(.*)/
        },
        src: "*.html"
      }
    },
    jshint: {
      all: ['js/app.js']
    }
    // responsive_images: {
    //   dev: {
    //     options: {
    //       engine: 'im',
    //       sizes: [{
    //         width: 640,
    //         name: 'lg',
    //         quality: 50
    //       },{
    //         width: 1024,
    //         name: 'lg',
    //         suffix: '2x',
    //         quality: 50
    //       },{
    //         width: 450,
    //         name: 'md',
    //         quality: 50
    //       },{
    //         width: 200,
    //         name: 'sm',
    //         quality: 50
    //       }]
    //     },
    //     files: [{
    //       expand: true,
    //       src: ['*.{gif,jpg,png}'],
    //       cwd: 'images_src/',
    //       dest: 'images/'
    //     }]
    //   }
    // },

  });

  // grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-html');
  grunt.registerTask('default', ['watch', 'html']);

};
