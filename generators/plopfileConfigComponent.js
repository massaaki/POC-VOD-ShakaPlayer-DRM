module.exports = (plop) => {
  plop.setGenerator('component', {
    description: 'Create a component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your component name?'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '../src/ui/components/{{pascalCase name}}/index.tsx',
        templateFile: 'templates/component/Component.tsx.hbs'
      },
      {
        type: 'add',
        path: '../src/ui/components/{{pascalCase name}}/styles.module.scss',
        templateFile: 'templates/component/styles.module.scss.hbs'
      },
      {
        type: 'add',
        path: '../src/ui/components/{{pascalCase name}}/stories.tsx',
        templateFile: 'templates/component/stories.tsx.hbs'
      },
      {
        type: 'add',
        path: '../src/ui/components/{{pascalCase name}}/test.tsx',
        templateFile: 'templates/component/test.tsx.hbs'
      }
    ]
  })
}
