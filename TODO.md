# TODOS
[x] figure out how to open dev tools
[x] figure out how to hot reload code
    current solution emacs macro binding with
        https://www.emacswiki.org/emacs/KeyboardMacros
    and reloading from shell
    not ideal should fix later
[x] keyboard shortcut to open app dropdown
    - hello world in center of screen with keybinding
[x] fix pause unpause bug
[x] enter to add a task and start its timer
    [x] local keypress for enter
    [x] inter process communication
    [x] display start stop and pause buttons
    [x] display a timer
    [x] have the timer respond to selecting a task
        [x] show currently running task
[x] show running task in open toolbar
[x] clean up code for the running of the timer
[x] dropdown of existing tasks fuzzy search select them
[x] same key as open to close, escape to close
[x] up and down arrows to select into dropdown
[x] shortcut to play and pause tasks
[x] play/pause not working
[x] show list of tasks in toolbar with amount of time spent on them
[x] turn the display of tasks into a table.. need to have the columns align correctly
    [x] lookup flexbox tables -
[x] repeatedly hiting stop does some wild shit
[ ] way to persist tasks on device
    [ ] how to do this?
    https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
[ ] confirm that saving works.
[ ] get the auto complete loading correctly
[ ] grab fuzzy search lib and get improved fuzzy search
[ ] make select from tasteful
[ ] pressing enter with nothing in the search box should not do anything. it should close.. yes
[ ] fix issue with initial timestamp. I should be backsetting it based on the duration - right now it does not account for pauses
[ ] set up icons from sketch
[ ] break some code into seperate files
[ ] add a menu icon that has an exit, download data button, delete data button (don't really delete just move it over to new data set)
[ ] clean up code and deploy finished version 0.1 - figure out how to build
[ ] hotkey to bring up inspector, make state global?
[ ] begin using and make record of bugs
[ ] design better ui / icon
    [ ] make more pleasing on the eyes. the all white is blegh
    [ ] more pleasing dropdown selection


# ISSUES:
- cannot do open toolbar via hotkey due to api not giving coordinates of the toolbar..

# Q's
is it better to have the first one selected and then have it be create new one orrr be dropdown to select

Consider making the day timestamp be a rolling last 24 hrs?
