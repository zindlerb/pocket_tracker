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
[ ] same key as open to close, escape to close
[ ] up and down arrows to select into dropdown
[ ] shortcut to play and pause tasks
[ ] show list of tasks in toolbar with amount of time spent on them
[ ] way to persist tasks on device
    [ ] how to do this?
[ ] way to persist data - flat file json that is versioned
    https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
[ ] clean up code and deploy finished version 0.1
[ ] show different icon for different states


# ISSUES:
- cannot do open toolbar via hotkey due to api not giving coordinates of the toolbar..

# Q's
is it better to have the first one selected and then have it be create new one orrr be dropdown to select
