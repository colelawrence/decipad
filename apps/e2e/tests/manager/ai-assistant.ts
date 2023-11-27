import { expect, type Locator, type Page } from '@playwright/test';

export class AiAssistant {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly chatToggle: Locator;
  readonly sendMessage: Locator;
  readonly finishedMessage = {
    mode: 'create',
    message: {
      role: 'assistant',
      content: 'done',
    },
  };
  readonly addParagraphMessage = [
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_paragraph',
          arguments: '{"text":"Hello!"}',
        },
      },
    },
    this.finishedMessage,
  ];
  readonly addFormulaMessage = [
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_calculation',
          arguments: '{"label":"SimpleAddition","math_statement":"1 + 1"}',
        },
      },
    },
    this.finishedMessage,
  ];
  readonly addVariableMessage = [
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_variable',
          arguments: '{"label":"InitialInvestment","value":"200"}',
        },
      },
    },
    this.finishedMessage,
  ];
  readonly addInputMessage = [
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_variable',
          arguments: '{"label":"NumberOfBananas","value":"10"}',
        },
      },
    },
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'variable_to_input_widget',
          arguments: '{"variable_name":"NumberOfBananas"}',
        },
      },
    },
    this.finishedMessage,
  ];
  readonly addSliderMessage = [
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_variable',
          arguments: '{"label":"NumberOfCars","value":"10"}',
        },
      },
    },
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'variable_to_input_widget',
          arguments: '{"variable_name":"NumberOfCars"}',
        },
      },
    },
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'input_widget_to_slider',
          arguments: '{"variable_name":"NumberOfCars"}',
        },
      },
    },
    this.finishedMessage,
  ];
  readonly addTableMessage = [
    {
      mode: 'create',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_table',
          arguments:
            '{\n  "label": "CityInformation",\n  "columns": ["City", "Country", "Population", "Area (km\\u00b2)", "Density (per km\\u00b2)"],\n  "rows": [\n    ["New York", "USA", "8,336,817", "783.8", "10,933"],\n    ["Tokyo", "Japan", "13,515,271", "2,194", "6,158"],\n    ["Paris", "France", "2,161,000", "105.4", "20,499"],\n    ["London", "UK", "8,982,000", "1,572", "5,701"],\n    ["Sydney", "Australia", "5,312,163", "12,368", "429"]\n  ]\n}',
        },
      },
    },
    this.finishedMessage,
  ];

  constructor(page: Page) {
    this.page = page;
    this.messageInput = this.page.getByTestId('message-input');
    this.chatToggle = this.page.getByLabel('SparklesAI');
    this.sendMessage = this.page.getByRole('button', { name: 'Send' });
  }

  /**
   * Mock AI Assistant response.
   *
   */
  async mockAPI(
    responses: {
      mode: string;
      message: {
        role: string;
        content: string | null;
        function_call?: {
          name: string;
          arguments: string;
        };
      };
    }[]
  ) {
    let responseIndex = 0;
    await this.page.route('*/**/api/ai/chat/*', async (route) => {
      const json = responses[responseIndex];
      responseIndex = (responseIndex + 1) % responses.length; // Cycle through responses
      await route.fulfill({ json });
    });
  }

  /**
   * Send AI Assistant Message
   */
  async sendChatMessage(message: string) {
    await this.messageInput.click();
    await this.messageInput.fill(message);
    await this.sendMessage.click();
  }

  /**
   * Mock AI Assistant adding a formula.
   */
  async mockAddFormula() {
    await this.mockAPI(this.addFormulaMessage);
    await this.sendChatMessage('add formula');
    await expect(async () => {
      await expect(this.page.getByText('SimpleAddition')).toBeVisible();
      await expect(this.page.getByText('done')).toBeVisible();
    }, "Calculation wasn't added").toPass();
  }

  /**
   * Mock AI Assistant adding a formula.
   */
  async mockAddVariable() {
    await this.mockAPI(this.addVariableMessage);
    await this.sendChatMessage('add variable');
    await expect(async () => {
      await expect(this.page.getByText('InitialInvestment')).toBeVisible();
      await expect(this.page.getByText('done')).toBeVisible();
    }, "Variable wasn't added").toPass();
  }

  /**
   * Mock AI Assistant adding an input widget.
   */
  async mockInputWidget() {
    await this.mockAPI(this.addInputMessage);
    await this.sendChatMessage('add input');
    await expect(async () => {
      await expect(this.page.getByText('NumberOfBananas')).toBeVisible();
      await expect(this.page.getByText('done')).toBeVisible();
    }, "Input wasn't added").toPass();
  }

  /**
   * Mock AI Assistant adding a slider widget.
   */
  async mockSliderWidget() {
    await this.mockAPI(this.addSliderMessage);
    await this.sendChatMessage('add slider');
    await expect(async () => {
      await expect(this.page.getByText('NumberOfCars')).toBeVisible();
      await expect(this.page.getByText('done')).toBeVisible();
    }, "Slider wasn't added").toPass();
  }

  /**
   * Mock AI Assistant adding a paragraph to the notebook.
   */
  async mockParagraph() {
    await this.mockAPI(this.addParagraphMessage);
    await this.sendChatMessage('add paragraph');
    await expect(async () => {
      await expect(this.page.getByText('Hello!')).toBeVisible();
      await expect(this.page.getByText('done')).toBeVisible();
    }, "Paragraph wasn't added").toPass();
  }

  /**
   * Mock AI Assistant adding a table to the notebook.
   */
  async mockTable() {
    await this.mockAPI(this.addTableMessage);
    await this.sendChatMessage('add table');
    await expect(async () => {
      await expect(this.page.getByText('CityInformation')).toBeVisible();
      await expect(this.page.getByText('New York')).toBeVisible();
      await expect(this.page.getByText('Country')).toBeVisible();
      await expect(this.page.getByText('done')).toBeVisible();
    }, "Table wasn't added").toPass();
  }

  /**
   * Open AI Assistant Pannel.
   */
  async openPannel() {
    await expect(async () => {
      await this.chatToggle.click();
      await expect(this.messageInput).toBeVisible();
    }, "AI show didn't open").toPass();
  }
}
