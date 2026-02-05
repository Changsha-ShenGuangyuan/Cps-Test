module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'unused-imports'
  ],
  ignorePatterns: [
    'dist/**',
    'router-backup.ts',
    'test-meta-tags.html',
    'auto-imports.d.ts'
  ],
  globals: {
    // Vue 3 Composition API
    ref: 'readonly',
    computed: 'readonly',
    watch: 'readonly',
    watchEffect: 'readonly',
    onMounted: 'readonly',
    onUnmounted: 'readonly',
    onBeforeMount: 'readonly',
    onBeforeUnmount: 'readonly',
    onUpdated: 'readonly',
    onBeforeUpdate: 'readonly',
    onErrorCaptured: 'readonly',
    onRenderTracked: 'readonly',
    onRenderTriggered: 'readonly',
    onActivated: 'readonly',
    onDeactivated: 'readonly',
    defineAsyncComponent: 'readonly',
    shallowRef: 'readonly',
    triggerRef: 'readonly',
    customRef: 'readonly',
    provide: 'readonly',
    inject: 'readonly',
    nextTick: 'readonly',
    // Vue Router
    useRouter: 'readonly',
    useRoute: 'readonly',
    onBeforeRouteUpdate: 'readonly',
    onBeforeRouteLeave: 'readonly',
    // Vue I18n
    useI18n: 'readonly',
    // Pinia
    defineStore: 'readonly',
    storeToRefs: 'readonly'
  },
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ]
  }
}
