# Example of CORE vendor implementation

This is "just" an example repository for "vendor" that will try to estimate work
to implement [CORE by PushPushGo](https://core.pushpushgo.com) in their system.
It's not stand alone project. It's not optimized and cannot be used in
production.

## What it contains?

Full journey.

1. Create new project
2. Integrate Website (copy & paste integration code)
3. Register Subscriber (on integrated website)
4. Send mass campaign (title & content) for example
5. Collect & see subscription statistics
6. Collect & see campaign statistics
7. Get list of subscribers and campaigns

### Source

In `domain` directory it's full raw implementation for push notifications model
without any "dependences". It contains, subscription, campaign, etc. In
`routes/api` you can find some poor api implementations. Example endpoints for
"get subscription" or "events" for statistics. In `routes/pages` you will find
ui pages and elements. Example raw views.

### Requirements

To run this example you will need:

1. Deno `curl -fsSL https://deno.land/x/install/install.sh | sh`

or

https://deno.land/manual/getting_started/installation

2. Localtunnel.me `npm install -g localtunnel`

3. For example-website integration preview: `npm install -g live-server`

### Run the project

1. Create a tunnel (you can change this subdomain name, but remember to change
   also API_ENDPOINT env var later):

`lt --port 8000 --subdomain saas-example-full`

Make sure that you will get this subdomain! if not, please provide new name in
next steps.

2. Run app:

```
API_ENDPOINT="https://saas-example-full.loca.lt" PPG_CORE_ENDPOINT="https://api-core.pushpushgo.com/v1" PPG_CORE_TOKEN="..." deno task start
```

Need testing token? please join us [on Discord](https://discord.gg/NVpUWvreZa)
or contact via [email](mailto:support+core@pushpushgo.com)

3. Go to website `https://saas-example-full.loca.lt` and authorize your IP
   address for tunnel `curl ipv4.icanhazip.com`

4. Create new project
5. Go to "integration details" and copy codes and paste in
   ./example-websites/example-1 directory (worker, and index)
6. Run live-server `live-server ./example-websites/example-1`
7. Subscribe for notifications on `open http://localhost:8080`
8. Create new campaign and send notification.

#### Example websites

In directory `./example-websites` there is example of websites using during
tests - it's need to be rewrited with "new project" integration code. Just keep
for directory "structure".

Example websites can be run with `live-server ./example-websites/example-1`

### Tests

To run tests type `deno task test`
