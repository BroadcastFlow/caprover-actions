# CapRover GitHub Action

This GitHub Action enables you to automatically build Docker images, and deploy applications to CapRover. 

## Usage

Include the action in your workflow file. For example:

```yml
name: Build and Deploy
on: [push]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Build and Push Docker Image
      uses: threemedia/caprover-actions@master
      with:
        caprover_url: 'your-caprover-url'
        caprover_password: ${{ secrets.CAPROVER_PASSWORD }}
        app_name: 'your-app-name'
        docker_image_name: 'your-image-name'
        docker_image_tag: 'your-image-tag'
```

## Inputs

| Name | Description | Default | Required |
| ---- | ----------- | ------- | -------- |
| `caprover_url` | The URL of your CapRover instance. | None | Yes |
| `caprover_password` | The password for your CapRover instance. Usually stored in GitHub secrets. | None | Yes |
| `app_name` | The name of the application in CapRover. | None | Yes |
| `docker_image_name` | The name of the Docker image to be built. | None | Yes |
| `docker_image_tag` | The tag of the Docker image to be built. | `latest` | No |

## Contributing

Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

## License

[MIT License](./LICENSE.md)

