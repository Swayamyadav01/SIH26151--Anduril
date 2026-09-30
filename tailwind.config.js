module.exports = {
    content: ['./public/index.html', './public/js/**/*.js'],
    darkMode: 'class',
    theme: { extend: {
        colors: {
            primary:'#A3CFCD', 'primary-dark':'#82A0AA', 'primary-light':'rgba(163,207,205,0.15)',
            danger:'#ef4444', warning:'#f59e0b', success:'#10b981',
            background:'rgb(var(--bg-main-rgb) / <alpha-value>)', surface:'rgb(var(--bg-surface-rgb) / <alpha-value>)', 'surface-secondary':'rgb(var(--bg-subtle-rgb) / <alpha-value>)',
            'border-color':'rgb(var(--border-color-rgb) / <alpha-value>)', 'text-main':'rgb(var(--text-main-rgb) / <alpha-value>)', 'text-muted':'rgb(var(--text-muted-rgb) / <alpha-value>)'
        },
        fontFamily: { sans:['Inter','system-ui','sans-serif'], mono:['JetBrains Mono','ui-monospace','monospace'] }
    }}
};
