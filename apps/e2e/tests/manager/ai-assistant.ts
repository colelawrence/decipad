import { expect, type Locator, type Page } from '@playwright/test';

export class AiAssistant {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly chatToggle: Locator;
  readonly sendMessage: Locator;
  readonly mockUsage = {
    promptTokensUsed: 13099,
    completionTokensUsed: 12938,
  };
  readonly finishedMessage = {
    mode: 'creation',
    message: {
      role: 'assistant',
      content: 'done',
    },
    usage: this.mockUsage,
  };
  readonly chatMessage = [
    {
      mode: 'conversation',
      message: {
        role: 'assistant',
        content: 'test chat reply',
      },
      usage: {
        promptTokensUsed: 13099,
        completionTokensUsed: 12938,
      },
    },
  ];
  readonly addParagraphMessage = [
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'appendText',
          arguments: '{"markdownText":"Hello!"}',
        },
      },
      usage: this.mockUsage,
    },
    this.finishedMessage,
  ];
  readonly addFormulaMessage = [
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'appendCodeLine',
          arguments:
            '{"variableName":"SimpleAddition","codeExpression":"1 + 1"}',
        },
      },
      usage: this.mockUsage,
    },
    this.finishedMessage,
  ];
  readonly addVariableMessage = [
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'appendCodeLine',
          arguments:
            '{"variableName":"InitialInvestment","codeExpression":"200"}',
        },
      },
      usage: this.mockUsage,
    },
    this.finishedMessage,
  ];
  readonly addInputMessage = [
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'add_variable',
          arguments: '{"label":"NumberOfBananas","value":"10"}',
        },
      },
      usage: this.mockUsage,
    },
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'variable_to_input_widget',
          arguments: '{"variable_name":"NumberOfBananas"}',
        },
        usage: this.mockUsage,
      },
    },
    this.finishedMessage,
  ];
  readonly addSliderMessage = [
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'appendSliderVariable',
          arguments:
            '{"variableName":"NumberOfCars","initialValue":1000000,"unit":"cars","min":0,"max":10000000,"step":100000}',
        },
      },
      usage: this.mockUsage,
    },
    this.finishedMessage,
  ];
  readonly addTableMessage = [
    {
      mode: 'creation',
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'appendFilledTable',
          arguments:
            '{\n  "tableName": "CityInformation",\n  "columnNames": ["City", "Population", "Country"],\n  "rowsData": [\n    ["New York", "8419000", "USA"],\n    ["Los Angeles", "3980000", "USA"],\n    ["Chicago", "2716000", "USA"]\n  ]\n}',
        },
      },
      usage: this.mockUsage,
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
   * Mock AI Assistant cheat message.
   */
  async mockAIChat() {
    await this.mockAPI(this.chatMessage);
    await this.sendChatMessage('test chat');
    await expect(async () => {
      await expect(this.page.getByText('test chat reply')).toBeVisible();
    }).toPass();
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
      expect(
        await this.getChatMessages(),
        'Initial AI Chat Message Missing'
      ).toEqual([
        'Hey there! Keep in mind that this experimental version can make mistakes. Please, provide feedback to help us improve.',
      ]);
    }, "AI show didn't open").toPass();
  }

  /**
   * Return ai chat messages.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getChatMessages()
   * ```
   */
  async getChatMessages() {
    const tabsArray: string[] = [];
    for (const tabElement of await this.page
      .getByTestId('ai-chat-message')
      .all())
      tabsArray.push(await tabElement.innerText());

    return tabsArray;
  }

  /**
   * Clear ai chat messages.
   *
   * **Usage**
   *
   * ```js
   * await notebook.clearChat()
   * ```
   */
  async clearChat() {
    this.page.getByTestId('ai-chat-clear').click();
  }
}
