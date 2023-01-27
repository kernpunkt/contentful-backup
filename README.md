<div align="center">
<h1>Contentful Backup</h1>
<h3>A CDK stack for automatically generating Contentful backups.</h3>
</div>

This repository is a CDK stack which deploys a Lambda function and a S3 bucket to your AWS account and will run automatic backups from your [Contentful](https://contentful.com) instance.

### Contributors

| Image             | Name                     | Team                       | E-Mail                                       |
| ----------------- | ------------------------ | -------------------------- | -------------------------------------------- |
| ![][joern-avatar] | [Jörn Meyer][joern-link] | ![Funkeys++][logo-funkeys] | [joern.meyer@kernpunkt.de][joern-link-email] |

### Built with

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Contentful](https://img.shields.io/static/v1?style=for-the-badge&message=Contentful&color=2478CC&logo=Contentful&logoColor=FFFFFF&label=)

---

## Deploy

1. **Create your own environment file** by executing `cp .env.example .env`.
2. **Modify the values** in the `.env` file to your liking. Please pay special attention to the `SCHEDULE` variable[^1].
3. Afterwards, run `cdk synth`[^2].
4. Your backups will automatically show up in the S3 bucket called `[YOUR_PREFIX]-contentful-backup-bucket`.

---

## Useful commands

| Command         | Result                                               |
|-----------------|------------------------------------------------------|
| `npm run build` | compile typescript to js                             |
| `npm run watch` | watch for changes and compile                        |
| `npm run test`  | perform the jest unit tests                          |
| `cdk deploy`    | deploy this stack to your default AWS account/region |
| `cdk diff`      | compare deployed stack with current state            |
| `cdk synth`     | emits the synthesized CloudFormation template        |

[joern-avatar]: https://joern.url.lol/avatar-100-round
[joern-link]: https://joern.url.lol/🧑‍💻
[joern-link-email]: mailto:joern.meyer@kernpunkt.de
[logo-funkeys]: https://res.cloudinary.com/ddux8vytr/image/upload/w_100/v1674478625/kpotkgezxhtytnhsrhlk.jpg

[^1]: AWS uses the UTC timezone, so adjust accordingly.
[^2]: Remember to `export AWS_PROFILE=your-aws-profile` beforehand.