require('colors')
const { resolve } = require('node:path')
const { config } = require('dotenv')
const input = require('input')
const { sessions, TelegramClient, Logger } = require('telegram')

/* Loading the environment variables from a file named `.env` located in the same 
directory as the current script file. The `resolve` function from the `node:path`
module is used to get the absolute path of the `.env` file. The `dotenv` package
is used to load the environment variables from the file and make them available
in the `process.env` object. */
config({ path: resolve(__dirname, '.env') })

class Client {
  client

  /**
   * This is a constructor function that calls the getClient method.
   */
  constructor() {
    this.getClient()
  }

  /**
   * This function creates a new Telegram client using the provided API ID and
   * hash, and logs any errors.
   */
  async getClient() {
    try {
      const apiId = Number(process.env.API_ID)
      const apiHash = process.env.API_HASH
      const session = new sessions.StringSession()
      const options = { baseLogger: new Logger(['warn', 'error']) }
      this.client = new TelegramClient(session, apiId, apiHash, options)
    } catch (e) {
      this.throwError(e)
    }
  }

  /**
   * This function gets a session for a client by prompting for phone number,
   * password, and received code.
   */
  async getSession() {
    try {
      await this.client.start({
        phoneNumber: async () => await input.text('Phone number: '),
        password: async () => await input.password('Password: '),
        phoneCode: async () => await input.text('Received code: '),
        onError: e => {
          throw e
        },
      })

      const session = this.client.session.save()
      console.log(session)
      await this.client.sendMessage('me', {
        message: `<b> ➜ Your session:</b>\n<code>${session}</code>`,
        parse_mode: 'HTML',
      })
    } catch (e) {
      this.throwError(e)
    }
  }

  /**
   * This function logs an error message in red and prompts the user to confirm
   * before closing the console.
   * @param error - The `error` parameter is an object that represents an error
   * that occurred during the execution of the program. It typically contains
   * information about the type of error, the location where it occurred, and any
   * additional details that may be relevant to diagnosing and fixing the issue.
   */
  async throwError(error) {
    console.log(error.message?.red)
    await input.confirm('(confirm to close console)')
    process.exit(1)
  }
}

console.log(`
888             888                                                  
888             888                                                  
888             888                                                  
888888  .d88b.  888  .d88b.   .d88b.  888d888  8888b.  88888b.d88b.  
888    d8P  Y8b 888 d8P  Y8b d88P"88b 888P"       "88b 888 "888 "88b 
888    88888888 888 88888888 888  888 888     .d888888 888  888  888 
Y88b.  Y8b.     888 Y8b.     Y88b 888 888     888  888 888  888  888 
 "Y888  "Y8888  888  "Y8888   "Y88888 888     "Y888888 888  888  888 
                                  888                                
                             Y8b d88P                                
                              "Y88P"                                 
                  888                                            d8b                   
                  888                                            Y8P                   
                  888                                                                  
 .d88b.   .d88b.  888888     .d8888b   .d88b.  .d8888b  .d8888b  888  .d88b.  88888b.  
d88P"88b d8P  Y8b 888        88K      d8P  Y8b 88K      88K      888 d88""88b 888 "88b 
888  888 88888888 888        "Y8888b. 88888888 "Y8888b. "Y8888b. 888 888  888 888  888 
Y88b 888 Y8b.     Y88b.           X88 Y8b.          X88      X88 888 Y88..88P 888  888 
 "Y88888  "Y8888   "Y888      88888P'  "Y8888   88888P'  88888P' 888  "Y88P"  888  888 
     888                                                                               
Y8b d88P                                                                               
 "Y88P"                                                                                
`)

/* The code is creating a new instance of the `Client` class and assigning it to
the `client` constant. Then, it is calling the `getSession()` method on the
`client` object, which starts a new Telegram session and saves the session
string to the console and sends it as a message to the user's own Telegram
account. */
const client = new Client()
client.getSession()
