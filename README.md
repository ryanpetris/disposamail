**NOTE:** A newer-ish version of this project is available [here](https://gitlab.com/petris/disposamail-ext) ([gitlab.com/petris/disposamail-ext](https://gitlab.com/petris/disposamail-ext)), however it is designed to be used with external SMTP providers. I'm leaving this version up incase anyone wants a self-contained version of Disposamail, however it probably won't receive any updates from the new version.

# Disposamail

Disposamail is a simple mail server that randomly generates a username and allows mail to be sent to that username _while the user maintains a connection with Disposamail_. Once the user disconnects, that username is released and the server will no longer accept mail for that address. Mail is displayed to the user in their web browser.

## Project Location

A public instance of this project is hosted at [disposamail.net](http://disposamail.net/), and the source code primary hosted on [GitLab](https://gitlab.com/petris/disposamail). If you're browsing this source on GitHub or any other location, please visit [gitlab.com/petris/disposamail](https://gitlab.com/petris/disposamail) to get the latest copy.

## License

Disposamail is licensed under the GNU Affero General Public License Version 3. A copy of this license is available in the LICENSE file.
