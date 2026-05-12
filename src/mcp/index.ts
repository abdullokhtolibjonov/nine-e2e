import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium, Browser, BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { BasePage } from "../pages/BasePage";
import { getLocalSecretsIfExists } from "../helpers/getAwsParameters";
import * as fs from 'fs';
import * as path from 'path';

class PlaywrightMcpServer {
  private server: Server;
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  constructor() {
    this.server = new Server(
      {
        name: "nine-playwright-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async ensureBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: false });
      // Try to load admin state by default if it exists
      const adminState = path.join(process.cwd(), '.auth/admin.json');
      const storageState = fs.existsSync(adminState) ? adminState : undefined;
      
      this.context = await this.browser.newContext({ storageState });
      this.page = await this.context.newPage();
    }
    return { page: this.page!, context: this.context! };
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "mcp_navigate",
          description: "Navigate to a specific URL",
          inputSchema: {
            type: "object",
            properties: {
              url: { type: "string", description: "The URL to navigate to" },
            },
            required: ["url"],
          },
        },
        {
          name: "mcp_login_to_core",
          description: "Login to the core application using the LoginPage POM",
          inputSchema: {
            type: "object",
            properties: {
              email: { type: "string" },
              password: { type: "string" },
              url: { type: "string", description: "The login page URL" },
            },
            required: ["email", "password", "url"],
          },
        },
        {
          name: "mcp_get_status",
          description: "Get the current URL and page status",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "mcp_take_screenshot",
          description: "Take a screenshot of the current page",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the screenshot file" },
            },
          },
        },
        {
          name: "mcp_generate_test",
          description: "Generate a Playwright test file based on a workflow",
          inputSchema: {
            type: "object",
            properties: {
              filename: { type: "string", description: "Name of the file (e.g. login.spec.ts)" },
              testName: { type: "string", description: "Description of the test" },
              fixtures: { 
                type: "array", 
                items: { type: "string" },
                description: "Array of fixtures to use (e.g. ['loginPage'])"
              },
              steps: { 
                type: "array", 
                items: { type: "string" },
                description: "Array of code strings for the test steps"
              },
            },
            required: ["filename", "testName", "fixtures", "steps"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { page } = await this.ensureBrowser();
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "mcp_navigate": {
            const basePage = new BasePage(page);
            await basePage.navigateTo(args?.url as string);
            return {
              content: [{ type: "text", text: `Navigated to ${args?.url}. Current URL: ${page.url()}` }],
            };
          }

          case "mcp_login_to_core": {
            const loginPage = new LoginPage(page);
            await loginPage.loginToCore(
              args?.email as string,
              args?.password as string,
              args?.url as string
            );
            return {
              content: [{ type: "text", text: `Login attempt completed. Current URL: ${page.url()}` }],
            };
          }

          case "mcp_get_status": {
            return {
              content: [
                {
                  type: "text",
                  text: `Current URL: ${page.url()}\nTitle: ${await page.title()}`,
                },
              ],
            };
          }

          case "mcp_take_screenshot": {
            const screenshotName = (args?.name as string) || `screenshot-${Date.now()}.png`;
            const screenshotPath = path.join(process.cwd(), 'reports', screenshotName);
            fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
            await page.screenshot({ path: screenshotPath });
            return {
              content: [{ type: "text", text: `Screenshot saved to: ${screenshotPath}` }],
            };
          }

          case "mcp_generate_test": {
            const filename = args?.filename as string;
            const testName = args?.testName as string;
            const fixtures = (args?.fixtures as string[]).join(', ');
            const steps = (args?.steps as string[]).map(step => `  ${step}`).join('\n');

            const testContent = `import { test, expect } from '../../src/fixtures';

test('${testName}', async ({ ${fixtures} }) => {
${steps}
});
`;
            const testPath = path.join(process.cwd(), 'tests', 'e2e', filename);
            fs.mkdirSync(path.dirname(testPath), { recursive: true });
            fs.writeFileSync(testPath, testContent);

            return {
              content: [{ type: "text", text: `Test file generated successfully at: ${testPath}` }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Nine Playwright MCP Server running on stdio");
  }
}

const mcpServer = new PlaywrightMcpServer();
mcpServer.run().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
