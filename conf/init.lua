-- ─── Bootstrap lazy.nvim ─────────────────────────────────────────────
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- ─── Plugin Setup ────────────────────────────────────────────────────
require("lazy").setup({
  -- LSP base and installer
  { "neovim/nvim-lspconfig" },
  {
    "mason-org/mason.nvim",
    build = ":MasonUpdate",
    config = true,
  },
  {
    "mason-org/mason-lspconfig.nvim",
    opts = {},
    dependencies = {
      "mason-org/mason.nvim",
      "neovim/nvim-lspconfig",
      "hrsh7th/cmp-nvim-lsp", -- needed for capabilities
    }
  },


  -- Completion
  { "hrsh7th/nvim-cmp" },
  { "hrsh7th/cmp-nvim-lsp" },
  { "hrsh7th/cmp-buffer" },
  { "hrsh7th/cmp-path" },
  { "L3MON4D3/LuaSnip" },
  { "saadparwaiz1/cmp_luasnip" },

  -- Treesitter
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate"
  },

  -- Tree-sitter aware themes
  { "catppuccin/nvim" },
  { "folke/tokyonight.nvim" },
  { "ellisonleao/gruvbox.nvim" },

  -- Comments
  {
    "numToStr/Comment.nvim",
    opts = {},
    lazy = false
  },
  {
    "folke/todo-comments.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    opts = {}
  },

  -- Rainbow brackets
  { "HiPhish/rainbow-delimiters.nvim" },

  -- Git
  {
    "lewis6991/gitsigns.nvim",
    config = function()
      require("gitsigns").setup()
    end
  },
  {
    "sindrets/diffview.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("diffview").setup()
    end
  },
  {
    "kdheepak/lazygit.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    cmd = { "LazyGit" },
  },
  -- needed by diffview
  {
    "nvim-tree/nvim-web-devicons",
    lazy = true, -- Optional: load on demand
    opts = {},   -- Use defaults
  },


  -- Telescope
  {
    'nvim-telescope/telescope.nvim', tag = '0.1.8',
    dependencies = {
      'nvim-lua/plenary.nvim',
      -- Optional performance booster
      { 'nvim-telescope/telescope-fzf-native.nvim', build = 'make', cond = vim.fn.executable('make') == 1 }
    },
    config = function()
      local telescope = require('telescope')
      telescope.setup({
        defaults = {
          layout_strategy = 'horizontal',
          layout_config = {
            prompt_position = 'top',
          },
          sorting_strategy = 'ascending',
          winblend = 0,
        },
      })
  
      -- Load fzf extension if installed
      pcall(telescope.load_extension, 'fzf')
    end
  },

  -- Indentation
  {
    "lukas-reineke/indent-blankline.nvim",
    main = "ibl",
    opts = {
      scope = {
        enabled = true,
        -- highlight = { "Function", "Label" }, -- uses Tree-sitter node types
        -- include = {
        --   node_type = {
        --     ["*"] = { "class", "function", "method", "if_statement", "for_statement" }
        --   },
        -- },
      },
    },
  },


})

-- ─── LSP Config ──────────────────────────────────────────────────────
require("mason").setup()
require("mason-lspconfig").setup({
  ensure_installed = { "lua_ls", "ts_ls", "pyright" },
  automatic_installation = true,
})

--local lspconfig = require("lspconfig")
--local capabilities = require("cmp_nvim_lsp").default_capabilities()

--require("mason-lspconfig").setup_handlers({
--function(server_name)
--    lspconfig[server_name].setup({
--      capabilities = capabilities,
--    })
--  end,
--})

-- ─── Completion Config ───────────────────────────────────────────────
local cmp = require("cmp")
local luasnip = require("luasnip")

cmp.setup({
  snippet = {
    expand = function(args) luasnip.lsp_expand(args.body) end,
  },
  mapping = cmp.mapping.preset.insert({
    ["<Tab>"] = cmp.mapping.select_next_item(),
    ["<S-Tab>"] = cmp.mapping.select_prev_item(),
    ["<CR>"] = cmp.mapping.confirm({ select = true }),
  }),
  sources = {
    { name = "nvim_lsp" },
    { name = "luasnip" },
    { name = "buffer" },
    { name = "path" },
  },
})

-- ─── Treesitter Config ───────────────────────────────────────────────
require("nvim-treesitter.configs").setup({
  ensure_installed = { "lua", "javascript", "typescript", "python", "json" },
  highlight = { enable = true },
  indent = { enable = true },
})

-- ─── TODO Comments Navigation ────────────────────────────────────────
vim.keymap.set("n", "]t", function()
  require("todo-comments").jump_next()
end, { desc = "Next TODO comment" })

vim.keymap.set("n", "[t", function()
  require("todo-comments").jump_prev()
end, { desc = "Previous TODO comment" })

vim.keymap.set("n", "<C-_>", function()
  require("Comment.api").toggle.linewise.current()
end, { desc = "Toggle comment line" })

vim.keymap.set("v", "<C-_>", function()
  local esc = vim.api.nvim_replace_termcodes("<Esc>", true, false, true)
  vim.api.nvim_feedkeys(esc, "nx", false)
  require("Comment.api").toggle.linewise(vim.fn.visualmode())
end, { desc = "Toggle comment selection" })


-- Rainbow brackets
local rainbow_delimiters = require('rainbow-delimiters')

vim.g.rainbow_delimiters = {
  strategy = {
    [''] = rainbow_delimiters.strategy['global'],
    vim = rainbow_delimiters.strategy['local'],
  },
  query = {
    [''] = 'rainbow-delimiters',
    lua = 'rainbow-blocks',
  },
  priority = {
    [''] = 110,
    lua = 210,
  },
}

-- Git
vim.keymap.set("n", "<leader>gd", "<cmd>DiffviewOpen<CR>", { desc = "Open diff view" })
vim.keymap.set("n", "<leader>gD", "<cmd>DiffviewClose<CR>", { desc = "Close diff view" })

vim.keymap.set("n", "<leader>lg", "<cmd>LazyGit<CR>", { desc = "Open Lazygit" })

-- Telescope
local builtin = require('telescope.builtin')
vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = 'Find Files' })
vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = 'Live Grep' })
vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = 'Find Buffers' })
vim.keymap.set('n', '<leader>fh', builtin.help_tags, { desc = 'Help Tags' })


-- Other config

vim.cmd.colorscheme( 'tokyonight' )

vim.opt.signcolumn = 'yes'

vim.opt.number = true
vim.opt.relativenumber = false

vim.opt.tabstop = 2 -- number of visual spaces per TAB
vim.opt.shiftwidth = 2 -- number of spaces for autoindent
vim.opt.expandtab = true -- convert tabs to spaces

--[[
vim.opt.list = true
vim.opt.listchars = {
  space = "·",   -- or "⋅" or "•"
  tab = "→ ",    -- tab character
  trail = "·",   -- trailing spaces
  extends = "»",
  precedes = "«"
}
--]]

-- Map Ctrl+S to save in normal, insert, and visual mode
vim.keymap.set({ "n", "v", "i" }, "<C-s>", "<cmd>w<CR>", { desc = "Save file" })

