var player = require('play-sound')(opts = {})
const AUDIO_FILE = 'Na_lipsync.m4a';
// // $ mplayer foo.mp3 
// player.play('foo.mp3', function(err){
//   if (err) throw err
// })

// { timeout: 10000ms } will be passed to child process
// player.play(AUDIO_FILE, { timeout: 10000 }, function(err){
//   if (err) throw err
// })

// // configure arguments for executable if any
// player.play('foo.mp3', { afplay: ['-v', 1 ] /* lower volume for afplay on OSX */ }, function(err){
//   if (err) throw err
// })

// access the node child_process in case you need to kill it on demand
var audio = player.play(AUDIO_FILE, function(err){
  if (err && !err.killed) throw err
})
// timer to end the music after 5 seconds
setTimeout(function () {
  audio.kill()
}, 5000);
