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
[ ] turn the display of tasks into a table.. need to have the columns align correctly
    [ ] lookup flexbox tables
[ ] way to persist tasks on device
    [ ] how to do this?
    https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
[ ] grab fuzzy search lib and get improved fuzzy search
[ ] fix issue with initial timestamp. I should be backsetting it based on the duration - right now it does not account for pauses
[ ] clean up code and deploy finished version 0.1 - figure out how to build
[ ] design better ui / icon
    [ ] quit button
    [ ] export data button
    [ ] show different icon for different states
[ ] code up v1 ui
[ ] use it for a week and incrementally add features


# ISSUES:
- cannot do open toolbar via hotkey due to api not giving coordinates of the toolbar..

# Q's
is it better to have the first one selected and then have it be create new one orrr be dropdown to select

Consider making the day timestamp be a rolling last 24 hrs?
