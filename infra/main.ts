import { App } from 'cdktf';
import { ProjectStack } from './stacks/project.stack';

const app = new App();

new ProjectStack(app, 'dev-project-stack', {
  environmentName: 'dev',
  region: 'us-east-1',
});

app.synth();
