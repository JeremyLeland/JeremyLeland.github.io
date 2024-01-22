call plug#begin()

Plug 'sheerun/vim-polyglot'
Plug 'neoclide/coc.nvim', { 'branch': 'release' }

call plug#end()

set nocompatible
set mouse=a
source $VIMRUNTIME/mswin.vim
behave mswin
syntax on
"colorscheme xoria256
"colorscheme desert256

" Indentation
filetype plugin indent on
set expandtab
set tabstop=2
set shiftwidth=2
set softtabstop=2
"set autoindent
"set cindent

" Searching
set ignorecase
set smartcase
set gdefault
set hlsearch
set incsearch

" Simplify GUI (gVim)
if has("gui_running")
   set guioptions -=T
   set guioptions -=m
   set guioptions -=a
   set guioptions +=Lrb
   set guioptions -=Lrb
   set guicursor +=a:blinkon0
   "set gfn=Monospace\ 9
   "set gfn=Terminus\ 9
   " for windows:
   " set guifont=Consolas:h10
   " for mac:
   set guifont=Monaco:h10
endif

" Misc
set number
set nowrap
set ruler

" Make Ctrl+Backspace and Ctrl+Delete remove whole words
imap <C-BS> <C-w>
imap <C-Del> <Esc>ldWi
