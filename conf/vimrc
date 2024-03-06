" vim-plug
" https://github.com/junegunn/vim-plug/wiki/tips#automatic-installation

" Install vim-plug if not found
if empty(glob('~/.vim/autoload/plug.vim'))
  silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
endif

" Run PlugInstall if there are missing plugins
autocmd VimEnter * if len(filter(values(g:plugs), '!isdirectory(v:val.dir)'))
  \| PlugInstall --sync | source $MYVIMRC
\| endif

call plug#begin()

Plug 'sheerun/vim-polyglot'
Plug 'neoclide/coc.nvim', { 'branch': 'release' }
Plug 'preservim/nerdtree'

call plug#end()

let g:coc_global_extensions = [ 'coc-json', 'coc-tsserver' ]

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

