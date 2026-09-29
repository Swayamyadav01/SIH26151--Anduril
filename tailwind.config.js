module.exports = {
    content: ['./public/index.html', './public/js/**/*.js'],
    darkMode: 'class',
    theme: { extend: {
        colors: {
            primary:'#14b8a6', 'primary-dark':'#0f766e', 'primary-light':'#ccfbf1',
            danger:'#ef4444', warning:'#f59e0b', success:'#10b981',
            background:'rgb(var(--bg-main-rgb) / <alpha-value>)', surface:'rgb(var(--bg-surface-rgb) / <alpha-value>)', 'surface-secondary':'rgb(var(--bg-subtle-rgb) / <alpha-value>)',
            'border-color':'rgb(var(--border-color-rgb) / <alpha-value>)', 'text-main':'rgb(var(--text-main-rgb) / <alpha-value>)', 'text-muted':'rgb(var(--text-muted-rgb) / <alpha-value>)'
        },
        fontFamily: { sans:['Inter','system-ui','sans-serif'], mono:['JetBrains Mono','ui-monospace','monospace'] }
    }}
};
