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
        path: '../src/ui/template/{{pascalCase name}}/index.tsx',
        templateFile: 'templates/page/Component.tsx.hbs'
      },
      {
        type: 'add',
        path: '../src/ui/template/{{pascalCase name}}/styles.module.scss',
        templateFile: 'templates/page/styles.module.scss.hbs'
      },
      {
        type: 'add',
        path: '../src/ui/template/{{pascalCase name}}/test.tsx',
        templateFile: 'templates/page/test.tsx.hbs'
      },
      {
        type: 'add',
        path: '../src/pages/{{pascalCase name}}.tsx',
        templateFile: 'templates/page/page.tsx.hbs'
      }
    ]
  })
}
