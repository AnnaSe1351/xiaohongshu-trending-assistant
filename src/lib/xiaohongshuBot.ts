/**
 * 小红书爆款内容制作助手
 * 
 * 功能：收集小红书近1个月的爆款笔记，分析其元素特点，并根据分析结果制作类似内容及图片
 */

// 对话状态管理
interface ConversationState {
  currentStage: string;
  userRequest: {
    keyword: string;
    category: string;
    confirmed: boolean;
  };
  processingStatus: {
    dataCollected: boolean;
    analysisCompleted: boolean;
    contentCreated: boolean;
    linksGenerated: boolean;
  };
  collectedData: {
    trendingNotes: any[];
    totalFound: number;
    selectedCount: number;
  };
  analysisResult: any;
  creationResult: {
    title: string;
    content: string;
    images: any[];
    tags: string[];
    downloadLink: string;
    previewLink: string;
  };
}

export class XiaohongshuBot {
  private conversationState: ConversationState;

  constructor() {
    this.resetConversationState();
  }

  /**
   * 主入口函数 - 处理用户消息
   */
  async handleUserMessage(userMessage: string) {
    // 根据当前对话阶段处理用户消息
    switch (this.conversationState.currentStage) {
      case 'greeting':
        return this.handleGreetingStage(userMessage);
      
      case 'collecting_needs':
        return this.handleCollectingNeedsStage(userMessage);
      
      case 'confirming_info':
        return this.handleConfirmingInfoStage(userMessage);
      
      case 'processing':
        return this.handleProcessingStage(userMessage);
      
      case 'showing_results':
        return this.handleShowingResultsStage(userMessage);
      
      case 'collecting_feedback':
        return this.handleCollectingFeedbackStage(userMessage);
      
      case 'ending':
        return this.handleEndingStage(userMessage);
      
      default:
        // 如果状态异常，重置为问候阶段
        this.conversationState.currentStage = 'greeting';
        return this.handleGreetingStage(userMessage);
    }
  }

  /**
   * 处理问候阶段
   */
  private handleGreetingStage(userMessage: string) {
    // 重置对话状态
    this.resetConversationState();
    
    // 进入需求收集阶段
    this.conversationState.currentStage = 'collecting_needs';
    
    // 返回问候语和功能介绍
    return {
      type: 'text',
      content: `你好！我是小红书爆款内容制作助手。我可以帮你收集小红书近1个月的爆款笔记，分析其元素特点，并根据分析结果制作类似的爆款内容及图片。

你可以告诉我你感兴趣的关键词和类目，我会为你找到相关的爆款内容并进行分析。需要我为你制作什么类型的小红书爆款内容呢？`
    };
  }

  /**
   * 处理需求收集阶段
   */
  private handleCollectingNeedsStage(userMessage: string) {
    // 分析用户消息，提取关键词和类目
    const extractedInfo = this.extractKeywordAndCategory(userMessage);
    
    // 如果成功提取到关键词和类目
    if (extractedInfo.keyword && extractedInfo.category) {
      // 更新用户需求信息
      this.conversationState.userRequest.keyword = extractedInfo.keyword;
      this.conversationState.userRequest.category = extractedInfo.category;
      
      // 进入确认信息阶段
      this.conversationState.currentStage = 'confirming_info';
      
      // 返回确认信息
      return {
        type: 'text',
        content: `非常好！让我确认一下你的需求：

- 关键词：${extractedInfo.keyword}
- 类目：${extractedInfo.category}

我将基于这些信息，为你收集小红书近1个月内关于"${extractedInfo.keyword}"的${extractedInfo.category}类爆款笔记，分析其特点，并制作类似内容。

这些信息是否准确？如果准确，我将立即开始收集和分析；如果需要调整，请告诉我。`
      };
    } 
    // 如果只提取到关键词，但没有类目
    else if (extractedInfo.keyword && !extractedInfo.category) {
      // 更新关键词
      this.conversationState.userRequest.keyword = extractedInfo.keyword;
      
      // 请求用户提供类目
      return {
        type: 'text',
        content: `我注意到你对"${extractedInfo.keyword}"感兴趣，这是个很好的关键词！

为了帮你找到最相关的爆款内容，我还需要知道你希望的内容类目。例如：产品测评、使用心得、护肤技巧、穿搭分享、旅行攻略等。

请告诉我你希望的具体类目，这样我能为你找到最匹配的爆款内容。`
      };
    }
    // 如果只提取到类目，但没有关键词
    else if (!extractedInfo.keyword && extractedInfo.category) {
      // 更新类目
      this.conversationState.userRequest.category = extractedInfo.category;
      
      // 请求用户提供关键词
      return {
        type: 'text',
        content: `我了解到你对${extractedInfo.category}类内容感兴趣，这是个很受欢迎的类目！

为了帮你找到最相关的爆款内容，我还需要知道你感兴趣的具体关键词。例如：如果是护肤类，可以是"敏感肌"、"美白"、"抗衰老"等。

请告诉我你感兴趣的具体关键词，这样我能为你找到最匹配的爆款内容。`
      };
    }
    // 如果无法提取关键词和类目
    else {
      // 请求用户提供更明确的信息
      return {
        type: 'text',
        content: `为了帮你找到最相关的爆款内容，我需要了解一些更具体的信息：

1. 你想关注哪些具体关键词？例如：保湿、美白、抗衰老、敏感肌护理等。
2. 你希望内容属于哪个具体类目？例如：产品测评、使用心得、护肤技巧、成分分析等。

请告诉我你的具体需求，这样我能为你找到最匹配的爆款内容。`
      };
    }
  }

  /**
   * 处理确认信息阶段
   */
  private handleConfirmingInfoStage(userMessage: string) {
    // 判断用户是否确认信息
    if (this.isUserConfirming(userMessage)) {
      // 标记用户已确认信息
      this.conversationState.userRequest.confirmed = true;
      
      // 进入处理阶段
      this.conversationState.currentStage = 'processing';
      
      // 返回处理开始的通知
      return {
        type: 'text',
        content: `好的，我正在为你收集和分析小红书上关于"${this.conversationState.userRequest.keyword}"的${this.conversationState.userRequest.category}类爆款笔记。这个过程包括以下几个步骤：

1. 收集近1个月内的爆款笔记 [进行中...]
2. 分析笔记的文案和图片特点
3. 生成类似的内容和配图
4. 准备下载链接

整个过程预计需要几分钟时间，请稍候。我会及时向你更新进度。`
      };
    } else {
      // 返回需求收集阶段，重新收集信息
      this.conversationState.currentStage = 'collecting_needs';
      
      // 清空已收集的信息
      this.conversationState.userRequest.keyword = '';
      this.conversationState.userRequest.category = '';
      
      // 请求用户提供新的信息
      return {
        type: 'text',
        content: `没问题，让我们重新确认你的需求。

请告诉我你感兴趣的关键词和类目，例如"敏感肌保湿产品测评"或"复古风穿搭分享"等。`
      };
    }
  }

  /**
   * 处理处理阶段
   */
  private async handleProcessingStage(userMessage: string) {
    // 如果用户在处理过程中发送消息，提供进度更新
    
    // 检查当前处理进度
    if (!this.conversationState.processingStatus.dataCollected) {
      // 执行数据收集
      await this.collectTrendingNotes();
      
      // 更新处理状态
      this.conversationState.processingStatus.dataCollected = true;
      
      // 返回数据收集完成的通知
      return {
        type: 'text',
        content: `已完成爆款笔记收集，找到了${this.conversationState.collectedData.totalFound}篇相关笔记，筛选出${this.conversationState.collectedData.selectedCount}篇高质量爆款进行分析。

正在分析内容特点...`
      };
    } 
    else if (!this.conversationState.processingStatus.analysisCompleted) {
      // 执行内容分析
      await this.analyzeContent();
      
      // 更新处理状态
      this.conversationState.processingStatus.analysisCompleted = true;
      
      // 返回分析完成的通知
      return {
        type: 'text',
        content: `分析完成，已识别出爆款内容的关键特点和模式。

正在根据分析结果生成内容和配图...`
      };
    } 
    else if (!this.conversationState.processingStatus.contentCreated) {
      // 执行内容创作
      await this.createContent();
      
      // 更新处理状态
      this.conversationState.processingStatus.contentCreated = true;
      
      // 返回内容创作完成的通知
      return {
        type: 'text',
        content: `内容和配图生成完成，正在准备下载链接...`
      };
    } 
    else if (!this.conversationState.processingStatus.linksGenerated) {
      // 生成下载链接
      await this.generateDownloadLinks();
      
      // 更新处理状态
      this.conversationState.processingStatus.linksGenerated = true;
      
      // 进入结果展示阶段
      this.conversationState.currentStage = 'showing_results';
      
      // 返回处理完成，展示结果
      return this.showResults();
    } 
    else {
      // 所有处理已完成，进入结果展示阶段
      this.conversationState.currentStage = 'showing_results';
      
      // 返回结果
      return this.showResults();
    }
  }

  /**
   * 处理结果展示阶段
   */
  private handleShowingResultsStage(userMessage: string) {
    // 进入反馈收集阶段
    this.conversationState.currentStage = 'collecting_feedback';
    
    // 返回反馈请求
    return {
      type: 'text',
      content: `非常高兴你喜欢这些内容！为了帮我提升服务质量，你能告诉我：

1. 这次生成的内容符合你的预期吗？
2. 有哪些方面你认为可以改进？
3. 下次你可能会需要什么类型的内容？

你的反馈对我非常宝贵，会帮助我为你提供更好的服务。`
    };
  }

  /**
   * 处理反馈收集阶段
   */
  private handleCollectingFeedbackStage(userMessage: string) {
    // 进入结束阶段
    this.conversationState.currentStage = 'ending';
    
    // 分析用户反馈
    const feedback = this.analyzeFeedback(userMessage);
    
    // 返回结束语
    return {
      type: 'text',
      content: `感谢你的反馈！${feedback.responseMessage}

你的小红书爆款内容已经准备就绪，随时可以通过之前提供的链接下载使用。如果你有任何问题，或者需要制作其他类型的爆款内容，随时告诉我，我很乐意继续为你服务！

祝你的小红书内容获得高互动！还有其他我能帮到你的吗？`
    };
  }

  /**
   * 处理结束阶段
   */
  private handleEndingStage(userMessage: string) {
    // 检查是否是新的请求
    if (this.isNewRequest(userMessage)) {
      // 重置为问候阶段，开始新的对话
      return this.handleGreetingStage(userMessage);
    } else {
      // 继续保持在结束阶段
      return {
        type: 'text',
        content: `很高兴能帮到你！如果你有新的需求，或者想要制作其他类型的小红书爆款内容，随时告诉我。

我随时准备为你提供帮助！`
      };
    }
  }

  /**
   * 展示处理结果
   */
  private showResults() {
    // 构建结果展示消息
    return {
      type: 'text',
      content: `好消息！我已经完成了关于"${this.conversationState.userRequest.keyword}"的${this.conversationState.userRequest.category}内容制作。以下是处理结果：

【分析发现】
我分析了近1个月内${this.conversationState.collectedData.selectedCount}篇相关爆款笔记，发现以下特点：
1. ${this.conversationState.analysisResult.key_findings[0]}
2. ${this.conversationState.analysisResult.key_findings[1]}
3. ${this.conversationState.analysisResult.key_findings[2]}
4. ${this.conversationState.analysisResult.key_findings[3]}

【生成内容预览】
标题：《${this.conversationState.creationResult.title}》

内容摘要：
"${this.conversationState.creationResult.content.substring(0, 200)}..."

[图片预览]

【下载链接】
完整内容包（含${this.conversationState.creationResult.images.length}张配图+完整文案）：[点击下载](${this.conversationState.creationResult.downloadLink})

你可以直接使用这些内容发布到小红书，或根据需要进行个性化调整。内容已经根据小红书爆款特点优化，有较高的互动潜力。

需要我为你解释任何部分，或者你对内容有任何调整建议吗？`
    };
  }

  /**
   * 收集小红书爆款笔记
   */
  private async collectTrendingNotes() {
    // 模拟数据收集过程
    // 在实际实现中，这里会调用搜索API或网络爬虫获取小红书内容
    
    console.log(`正在收集关键词"${this.conversationState.userRequest.keyword}"、类目"${this.conversationState.userRequest.category}"的爆款笔记...`);
    
    // 等待2秒，模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟收集到的数据
    const mockTotalFound = Math.floor(Math.random() * 30) + 20; // 20-50之间的随机数
    const mockSelectedCount = Math.floor(Math.random() * 5) + 5; // 5-10之间的随机数
    
    // 更新收集到的数据
    this.conversationState.collectedData.totalFound = mockTotalFound;
    this.conversationState.collectedData.selectedCount = mockSelectedCount;
    
    // 模拟爆款笔记数据
    this.conversationState.collectedData.trendingNotes = this.generateMockTrendingNotes(
      this.conversationState.userRequest.keyword,
      this.conversationState.userRequest.category,
      mockSelectedCount
    );
    
    console.log(`收集完成，找到${mockTotalFound}篇相关笔记，筛选出${mockSelectedCount}篇爆款`);
    
    return true;
  }

  /**
   * 分析内容
   */
  private async analyzeContent() {
    // 模拟内容分析过程
    // 在实际实现中，这里会调用文本分析和图像分析API
    
    console.log(`正在分析${this.conversationState.collectedData.selectedCount}篇爆款笔记的内容特点...`);
    
    // 等待2秒，模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟分析结果
    this.conversationState.analysisResult = this.generateMockAnalysisResult(
      this.conversationState.userRequest.keyword,
      this.conversationState.userRequest.category,
      this.conversationState.collectedData.trendingNotes
    );
    
    console.log(`分析完成，已识别出爆款内容的关键特点和模式`);
    
    return true;
  }

  /**
   * 创建内容
   */
  private async createContent() {
    // 模拟内容创作过程
    // 在实际实现中，这里会调用文本生成和图像生成API
    
    console.log(`正在根据分析结果创作内容...`);
    
    // 等待3秒，模拟创作过程
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 模拟创作结果
    const mockCreationResult = this.generateMockCreationResult(
      this.conversationState.userRequest.keyword,
      this.conversationState.userRequest.category,
      this.conversationState.analysisResult
    );
    
    // 更新创作结果
    this.conversationState.creationResult = mockCreationResult;
    
    console.log(`内容创作完成，生成了标题、正文和${mockCreationResult.images.length}张图片`);
    
    return true;
  }

  /**
   * 生成下载链接
   */
  private async generateDownloadLinks() {
    // 模拟链接生成过程
    // 在实际实现中，这里会上传文件到云存储并生成下载链接
    
    console.log(`正在生成下载链接...`);
    
    // 等待1秒，模拟链接生成过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟下载链接
    const mockDownloadLink = `https://example.com/download/${this.generateUniqueId()}`;
    const mockPreviewLink = `https://example.com/preview/${this.generateUniqueId()}`;
    
    // 更新下载链接
    this.conversationState.creationResult.downloadLink = mockDownloadLink;
    this.conversationState.creationResult.previewLink = mockPreviewLink;
    
    console.log(`链接生成完成：${mockDownloadLink}`);
    
    return true;
  }

  /**
   * 从用户消息中提取关键词和类目
   */
  private extractKeywordAndCategory(message: string) {
    // 在实际实现中，这里会使用NLP技术分析用户消息
    // 这里使用简化的实现，基于关键词匹配
    
    const messageText = message.toLowerCase();
    let keyword = '';
    let category = '';
    
    // 尝试提取关键词
    const keywordPatterns = [
      /关于\s*[""]?([^""]+)[""]?\s*的/,
      /[""]([^""]+)[""].*?(?:相关|内容|笔记)/,
      /(?:想做|制作|创作)\s*[""]?([^""，。？！]+)[""]?/,
      /(?:关键词|话题)\s*[""]?([^""，。？！]+)[""]?/
    ];
    
    for (const pattern of keywordPatterns) {
      const match = messageText.match(pattern);
      if (match && match[1]) {
        keyword = match[1].trim();
        break;
      }
    }
    
    // 如果没有匹配到关键词，尝试从整个消息中提取
    if (!keyword) {
      // 排除常见的类目词
      const categoryWords = ['测评', '分享', '教程', '攻略', '心得', '技巧', '推荐', 'diy', '穿搭', '护肤', '美妆', '旅行', '美食', '健身'];
      const words = messageText.split(/\s+|[,，.。:：;；!！?？]/);
      
      for (const word of words) {
        if (word.length >= 2 && !categoryWords.some(c => word.includes(c))) {
          keyword = word;
          break;
        }
      }
    }
    
    // 尝试提取类目
    const categoryPatterns = [
      /(?:类目|分类|类型)\s*[""]?([^""，。？！]+)[""]?/,
      /[""]([^""]+)[""].*?(?:类|类目|分类|类型)/,
      /(?:测评|分享|教程|攻略|心得|技巧|推荐|diy|穿搭|护肤|美妆|旅行|美食|健身)/
    ];
    
    for (const pattern of categoryPatterns) {
      const match = messageText.match(pattern);
      if (match) {
        category = match[0].trim();
        break;
      }
    }
    
    return { keyword, category };
  }

  /**
   * 判断用户是否确认信息
   */
  private isUserConfirming(message: string) {
    const confirmPatterns = [
      /^是$/,
      /^对$/,
      /^确认$/,
      /^没问题$/,
      /^可以$/,
      /^正确$/,
      /^准确$/,
      /^开始$/,
      /^确定$/,
      /^是的$/,
      /^对的$/,
      /^好的$/,
      /^可以的$/,
      /^没错$/,
      /信息(正确|准确|没问题)/,
      /(正确|准确|没问题|可以)(，|。|！|\s)?$/
    ];
    
    const messageText = message.toLowerCase();
    
    return confirmPatterns.some(pattern => pattern.test(messageText));
  }

  /**
   * 判断是否是新的请求
   */
  private isNewRequest(message: string) {
    const newRequestPatterns = [
      /^我想/,
      /^我需要/,
      /^我要/,
      /^帮我/,
      /^请帮/,
      /^可以帮/,
      /^能帮/,
      /^制作/,
      /^创作/,
      /^生成/,
      /^做一个/,
      /^做一份/
    ];
    
    const messageText = message.toLowerCase();
    
    return newRequestPatterns.some(pattern => pattern.test(messageText));
  }

  /**
   * 分析用户反馈
   */
  private analyzeFeedback(message: string) {
    // 在实际实现中，这里会使用NLP技术分析用户反馈
    // 这里使用简化的实现，基于关键词匹配
    
    const messageText = message.toLowerCase();
    
    // 检查是否包含正面评价
    const positivePatterns = [
      /不错/,
      /很好/,
      /满意/,
      /喜欢/,
      /棒/,
      /赞/,
      /感谢/,
      /谢谢/,
      /好看/,
      /实用/,
      /有用/,
      /符合/,
      /期待/
    ];
    
    // 检查是否包含负面评价
    const negativePatterns = [
      /不好/,
      /不满意/,
      /不喜欢/,
      /不行/,
      /差/,
      /糟/,
      /失望/,
      /不符合/,
      /不实用/,
      /不准确/,
      /不匹配/
    ];
    
    // 检查是否包含改进建议
    const suggestionPatterns = [
      /希望/,
      /建议/,
      /可以更/,
      /应该/,
      /最好/,
      /如果能/,
      /下次/,
      /改进/,
      /提升/,
      /增加/,
      /减少/,
      /优化/
    ];
    
    // 判断反馈类型
    const isPositive = positivePatterns.some(pattern => pattern.test(messageText));
    const isNegative = negativePatterns.some(pattern => pattern.test(messageText));
    const hasSuggestion = suggestionPatterns.some(pattern => pattern.test(messageText));
    
    let responseMessage = '';
    
    if (isPositive && !isNegative) {
      responseMessage = '我会继续保持这样的服务质量，为你提供优质的内容。';
    } else if (isNegative && !isPositive) {
      responseMessage = '非常抱歉没能满足你的期望，我会努力改进，下次为你提供更好的内容。';
    } else if (isPositive && isNegative) {
      responseMessage = '感谢你的肯定和建议，我会在保持优点的同时努力改进不足之处。';
    } else {
      responseMessage = '我会记录你的反馈，不断优化我的服务。';
    }
    
    if (hasSuggestion) {
      responseMessage += ' 你的建议我已记录，这将帮助我在未来为你提供更符合期望的内容。';
    }
    
    return {
      isPositive,
      isNegative,
      hasSuggestion,
      responseMessage
    };
  }

  /**
   * 重置对话状态
   */
  private resetConversationState() {
    this.conversationState = {
      currentStage: 'greeting',
      userRequest: {
        keyword: '',
        category: '',
        confirmed: false
      },
      processingStatus: {
        dataCollected: false,
        analysisCompleted: false,
        contentCreated: false,
        linksGenerated: false
      },
      collectedData: {
        trendingNotes: [],
        totalFound: 0,
        selectedCount: 0
      },
      analysisResult: null,
      creationResult: {
        title: '',
        content: '',
        images: [],
        tags: [],
        downloadLink: '',
        previewLink: ''
      }
    };
  }

  /**
   * 生成唯一ID
   */
  private generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * 生成模拟爆款笔记数据
   */
  private generateMockTrendingNotes(keyword: string, category: string, count: number) {
    const notes = [];
    
    for (let i = 0; i < count; i++) {
      notes.push({
        id: `note${this.generateUniqueId()}`,
        title: this.generateMockTitle(keyword, category, i),
        author: {
          id: `user${this.generateUniqueId()}`,
          name: this.generateMockAuthorName(),
          followers: Math.floor(Math.random() * 50000) + 1000
        },
        publish_time: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        category: category,
        content: this.generateMockContent(keyword, category, i),
        images: this.generateMockImageUrls(Math.floor(Math.random() * 4) + 3), // 3-7张图片
        tags: this.generateMockTags(keyword, category),
        engagement: {
          likes: Math.floor(Math.random() * 5000) + 1000,
          collects: Math.floor(Math.random() * 2000) + 500,
          comments: Math.floor(Math.random() * 500) + 50,
          top_comments: this.generateMockComments(3)
        }
      });
    }
    
    return notes;
  }

  /**
   * 生成模拟标题
   */
  private generateMockTitle(keyword: string, category: string, index: number) {
    const titleTemplates = [
      `${keyword}必入！这${Math.floor(Math.random() * 5) + 3}款${category}真的绝了`,
      `谁说${keyword}不能${this.getRandomVerb()}？试试这个就知道了！`,
      `${this.getRandomAdjective()}${keyword}${category}，${this.getRandomResult()}`,
      `${Math.floor(Math.random() * 10) + 1}个${keyword}${category}小技巧，第${Math.floor(Math.random() * 5) + 3}个太惊艳了`,
      `${this.getRandomTimeFrame()}我只用这款${keyword}${category}，效果${this.getRandomAdjective()}`,
      `${this.getRandomPrefix()}${keyword}${category}分享，${this.getRandomSuffix()}`,
      `${this.getRandomQuestion()}${keyword}${category}？${this.getRandomAnswer()}`
    ];
    
    return titleTemplates[index % titleTemplates.length];
  }

  /**
   * 生成模拟内容
   */
  private generateMockContent(keyword: string, category: string, index: number) {
    // 简化实现，实际应生成更丰富的内容
    return `大家好呀！今天给大家分享一篇关于${keyword}的${category}。

最近发现很多小伙伴都在问关于${keyword}的问题，作为一个${this.getRandomExperience()}${keyword}的人，我决定来分享一下我的心得体会。

${this.getRandomIntro(keyword, category)}

${this.getRandomMainPoint(keyword, category, 1)}

${this.getRandomMainPoint(keyword, category, 2)}

${this.getRandomMainPoint(keyword, category, 3)}

${this.getRandomConclusion(keyword, category)}

如果你也喜欢这篇内容，别忘了点赞收藏加关注哦！你们的支持是我持续创作的动力！

有什么想了解的，可以在评论区告诉我，我会尽快回复大家～`;
  }

  /**
   * 生成模拟图片URL
   */
  private generateMockImageUrls(count: number) {
    const urls = [];
    
    for (let i = 0; i < count; i++) {
      urls.push(`https://example.com/images/${this.generateUniqueId()}.jpg`);
    }
    
    return urls;
  }

  /**
   * 生成模拟标签
   */
  private generateMockTags(keyword: string, category: string) {
    const baseTags = [keyword, category, '好物分享', '经验分享', '达人推荐'];
    const additionalTags = ['小红书', '种草', '好物', '推荐', '实用', '干货', '必入', '宝藏', '神器'];
    
    const tags = [...baseTags];
    
    // 随机添加3-5个额外标签
    const additionalCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < additionalCount; i++) {
      const randomIndex = Math.floor(Math.random() * additionalTags.length);
      if (!tags.includes(additionalTags[randomIndex])) {
        tags.push(additionalTags[randomIndex]);
      }
    }
    
    return tags;
  }

  /**
   * 生成模拟评论
   */
  private generateMockComments(count: number) {
    const commentTemplates = [
      '太实用了，收藏了！',
      '这个真的好用，我已经入手了',
      '感谢分享，正好需要这个',
      '请问在哪里可以买到呢？',
      '效果真的像你说的那么好吗？',
      '我用了一周了，效果确实不错',
      '包装看起来很精致，想入手',
      '价格是多少呀？',
      '这个适合敏感肌吗？',
      '我之前用过类似的，但没这么好用'
    ];
    
    const comments = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * commentTemplates.length);
      comments.push({
        user: `用户${this.generateUniqueId().substring(0, 6)}`,
        content: commentTemplates[randomIndex]
      });
    }
    
    return comments;
  }

  /**
   * 生成模拟作者名称
   */
  private generateMockAuthorName() {
    const prefixes = ['小', '大', '甜', '酷', '美', '潮', '萌', '酷', '闪', '亮'];
    const middles = ['白', '黑', '红', '绿', '蓝', '紫', '橙', '粉', '灰', '棕'];
    const suffixes = ['兔', '猫', '狗', '鱼', '鸟', '熊', '鹿', '象', '狐', '豹'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}${middle}${suffix}`;
  }

  /**
   * 生成模拟分析结果
   */
  private generateMockAnalysisResult(keyword: string, category: string, trendingNotes: any[]) {
    // 根据类目生成不同的分析结果
    let keyFindings = [];
    
    if (category.includes('测评') || category.includes('推荐')) {
      keyFindings = [
        `标题多采用"${keyword}必入"、"拯救${keyword}"等吸引眼球的表达`,
        `图片以产品实拍+使用效果对比为主，平均${Math.floor(Math.random() * 2) + 5}-${Math.floor(Math.random() * 2) + 7}张图片`,
        `文案结构通常为：痛点描述→产品介绍→使用体验→效果展示→总结推荐`,
        `高互动笔记平均字数在${Math.floor(Math.random() * 300) + 800}-${Math.floor(Math.random() * 300) + 1100}字之间`
      ];
    } else if (category.includes('教程') || category.includes('技巧')) {
      keyFindings = [
        `标题多采用数字列表形式，如"${Math.floor(Math.random() * 5) + 5}个${keyword}小技巧"`,
        `图片以步骤展示为主，每个步骤配1-2张图片，总计${Math.floor(Math.random() * 3) + 6}-${Math.floor(Math.random() * 3) + 9}张`,
        `文案结构通常为：问题引入→方法列举→步骤详解→效果展示→经验总结`,
        `高互动笔记多使用序号和小标题，增强可读性，平均字数${Math.floor(Math.random() * 300) + 900}-${Math.floor(Math.random() * 300) + 1200}字`
      ];
    } else if (category.includes('分享') || category.includes('心得')) {
      keyFindings = [
        `标题多采用个人经历+发现的形式，如"${this.getRandomTimeFrame()}我的${keyword}心得"`,
        `图片以真实场景和个人使用为主，平均${Math.floor(Math.random() * 2) + 4}-${Math.floor(Math.random() * 2) + 6}张图片`,
        `文案结构通常为：个人经历→问题描述→解决方案→变化过程→心得体会`,
        `高互动笔记语言风格亲切自然，多使用第一人称，平均字数${Math.floor(Math.random() * 300) + 700}-${Math.floor(Math.random() * 300) + 1000}字`
      ];
    } else {
      keyFindings = [
        `标题多采用疑问句或感叹句，增强互动性和吸引力`,
        `图片数量平均为${Math.floor(Math.random() * 3) + 5}张，多采用高清实拍图`,
        `文案结构清晰，段落分明，通常包含引言、主体、总结三部分`,
        `高互动笔记多在文末添加互动引导，如提问或号召行动`
      ];
    }
    
    return {
      analysis_id: `analysis${this.generateUniqueId()}`,
      timestamp: new Date().toISOString(),
      source_notes: trendingNotes.map(note => note.id),
      key_findings: keyFindings,
      success_factors: [
        '真实的个人体验分享',
        '清晰的前后效果对比',
        '详细的使用步骤和感受',
        '解决特定痛点的实用建议'
      ]
    };
  }

  /**
   * 生成模拟创作结果
   */
  private generateMockCreationResult(keyword: string, category: string, analysisResult: any) {
    // 生成标题
    const title = this.generateCreativeTitle(keyword, category, analysisResult);
    
    // 生成内容
    const content = this.generateCreativeContent(keyword, category, title, analysisResult);
    
    // 生成图片
    const imageCount = Math.floor(Math.random() * 3) + 5; // 5-8张图片
    const images = [];
    for (let i = 0; i < imageCount; i++) {
      images.push({
        url: `https://example.com/generated_images/${this.generateUniqueId()}.jpg`,
        type: this.getImageType(i, imageCount),
        width: 1080,
        height: 1920
      });
    }
    
    // 生成标签
    const tags = this.generateCreativeTags(keyword, category);
    
    return {
      title,
      content,
      images,
      tags,
      wordCount: content.length,
      imageCount,
      downloadLink: '',
      previewLink: ''
    };
  }

  /**
   * 生成创意标题
   */
  private generateCreativeTitle(keyword: string, category: string, analysisResult: any) {
    // 根据分析结果中的标题特点生成新标题
    const titlePatterns = [
      `${keyword}救星！这${Math.floor(Math.random() * 5) + 3}款${category}让你告别${this.getRandomProblem(keyword)}`,
      `我的${keyword}${category}心得：从${this.getRandomProblem(keyword)}到${this.getRandomSolution(keyword)}只需${Math.floor(Math.random() * 10) + 1}天`,
      `${this.getRandomPrefix()}${keyword}${category}指南，${this.getRandomSuffix()}`,
      `${Math.floor(Math.random() * 10) + 1}个${keyword}${category}秘诀，第${Math.floor(Math.random() * 5) + 3}个太惊艳了！`,
      `${this.getRandomQuestion()}${keyword}${category}？${this.getRandomAnswer()}`
    ];
    
    return titlePatterns[Math.floor(Math.random() * titlePatterns.length)];
  }

  /**
   * 生成创意内容
   */
  private generateCreativeContent(keyword: string, category: string, title: string, analysisResult: any) {
    // 根据分析结果中的内容结构生成新内容
    // 这里只生成一个简化版本，实际应更丰富
    
    return `大家好！今天给大家带来一篇关于${keyword}的${category}分享。

${this.getRandomIntro(keyword, category)}

作为一个${this.getRandomExperience()}${keyword}的人，我尝试了市面上各种各样的方法和产品，今天就来分享一下我的心得体会，希望能帮到同样被${this.getRandomProblem(keyword)}困扰的小伙伴们。

【${this.getRandomMainPointTitle(1)}】
${this.getRandomMainPoint(keyword, category, 1)}

【${this.getRandomMainPointTitle(2)}】
${this.getRandomMainPoint(keyword, category, 2)}

【${this.getRandomMainPointTitle(3)}】
${this.getRandomMainPoint(keyword, category, 3)}

【${this.getRandomMainPointTitle(4)}】
${this.getRandomMainPoint(keyword, category, 4)}

${this.getRandomConclusion(keyword, category)}

以上就是我的${keyword}${category}分享，希望对你有所帮助！如果你也有好的经验或者建议，欢迎在评论区留言交流哦～

记得点赞收藏加关注，我会持续分享更多${keyword}相关的内容！`;
  }

  /**
   * 生成创意标签
   */
  private generateCreativeTags(keyword: string, category: string) {
    const baseTags = [keyword, category, '好物分享', '经验分享', '达人推荐'];
    const emotionalTags = ['治愈', '舒适', '惊艳', '实用', '高效', '省心', '省钱', '高颜值', '好用'];
    const demographicTags = ['学生党', '上班族', '宝妈', '干皮', '油皮', '敏感肌', '新手', '达人', '博主'];
    
    const tags = [...baseTags];
    
    // 添加2-3个情感标签
    const emotionalCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < emotionalCount; i++) {
      const randomIndex = Math.floor(Math.random() * emotionalTags.length);
      if (!tags.includes(emotionalTags[randomIndex])) {
        tags.push(emotionalTags[randomIndex]);
      }
    }
    
    // 添加1-2个人群标签
    const demographicCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < demographicCount; i++) {
      const randomIndex = Math.floor(Math.random() * demographicTags.length);
      if (!tags.includes(demographicTags[randomIndex])) {
        tags.push(demographicTags[randomIndex]);
      }
    }
    
    return tags;
  }

  /**
   * 获取图片类型
   */
  private getImageType(index: number, totalCount: number) {
    if (index === 0) {
      return 'cover';
    } else if (index < totalCount / 3) {
      return 'product';
    } else if (index < totalCount * 2 / 3) {
      return 'usage';
    } else {
      return 'effect';
    }
  }

  /**
   * 获取随机动词
   */
  private getRandomVerb() {
    const verbs = ['变美', '改变', '提升', '解决', '搞定', '治愈', '修复', '改善', '告别', '拯救'];
    return verbs[Math.floor(Math.random() * verbs.length)];
  }

  /**
   * 获取随机形容词
   */
  private getRandomAdjective() {
    const adjectives = ['超级', '绝对', '真的', '超乎想象的', '意想不到的', '神奇的', '惊艳的', '令人惊喜的', '不可思议的', '治愈系'];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  /**
   * 获取随机结果
   */
  private getRandomResult() {
    const results = ['效果惊人', '太赞了', '真的绝了', '回购无数次', '用了就离不开', '真的太好用了', '强烈推荐', '必入清单', '人手必备', '太值了'];
    return results[Math.floor(Math.random() * results.length)];
  }

  /**
   * 获取随机时间段
   */
  private getRandomTimeFrame() {
    const timeFrames = ['这个月', '最近半年', '过去一年', '三个月来', '这段时间', '一周内', '半个月来', '这个季节', '换季期间', '最近'];
    return timeFrames[Math.floor(Math.random() * timeFrames.length)];
  }

  /**
   * 获取随机前缀
   */
  private getRandomPrefix() {
    const prefixes = ['超实用', '必入', '平价', '高效', '一秒', '懒人', '新手', '专业', '隐藏', '小众'];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  /**
   * 获取随机后缀
   */
  private getRandomSuffix() {
    const suffixes = ['效果惊人', '人人都能学会', '新手也能上手', '省时又省力', '真的太赞了', '学会就能用一辈子', '一看就会', '太实用了', '绝对值得一试', '回购无数次'];
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  /**
   * 获取随机问题
   */
  private getRandomQuestion() {
    const questions = ['为什么', '如何', '怎样', '谁说', '你知道吗', '想不想', '还在为', '是不是', '有没有', '需不需要'];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * 获取随机答案
   */
  private getRandomAnswer() {
    const answers = ['试试这个就知道了', '看完你就明白了', '学会这几招就够了', '答案在这里', '方法都在这了', '一篇文章告诉你', '太简单了', '其实很简单', '这篇笔记告诉你', '看完秒懂'];
    return answers[Math.floor(Math.random() * answers.length)];
  }

  /**
   * 获取随机经验
   */
  private getRandomExperience() {
    const experiences = ['研究', '使用', '体验', '测评', '关注', '痴迷', '热爱', '专注', '沉迷', '钻研'];
    return `${this.getRandomTimeFrame()}${experiences[Math.floor(Math.random() * experiences.length)]}`;
  }

  /**
   * 获取随机问题
   */
  private getRandomProblem(keyword: string) {
    const problems = ['困扰', '烦恼', '问题', '痛点', '难题', '挑战', '麻烦', '纠结', '不适', '不满'];
    return `${keyword}${problems[Math.floor(Math.random() * problems.length)]}`;
  }

  /**
   * 获取随机解决方案
   */
  private getRandomSolution(keyword: string) {
    const solutions = ['完美解决', '彻底改善', '显著提升', '明显改变', '有效缓解', '成功克服', '轻松搞定', '完全告别', '全面提高', '根本改变'];
    return `${keyword}${solutions[Math.floor(Math.random() * solutions.length)]}`;
  }

  /**
   * 获取随机介绍
   */
  private getRandomIntro(keyword: string, category: string) {
    const intros = [
      `相信很多小伙伴和我一样，都被${keyword}问题困扰过。今天我就来分享一下我的${category}经验，希望能帮到大家！`,
      `${this.getRandomTimeFrame()}我一直在研究${keyword}的${category}方法，终于找到了一些真正有效的技巧，迫不及待想和大家分享！`,
      `作为一个${keyword}${category}达人，我试过市面上各种各样的方法，今天就来分享那些真正有效的经验！`,
      `还在为${keyword}问题烦恼吗？这篇${category}笔记可能会改变你的生活！`,
      `${keyword}${category}其实没有那么难，掌握了正确方法，人人都能做到！今天就来分享我的心得。`
    ];
    
    return intros[Math.floor(Math.random() * intros.length)];
  }

  /**
   * 获取随机主要观点标题
   */
  private getRandomMainPointTitle(index: number) {
    const titles = [
      ['首先', '第一步', '基础准备', '开始之前', '先决条件'],
      ['接着', '第二步', '核心技巧', '关键环节', '重要发现'],
      ['然后', '第三步', '进阶方法', '实用技巧', '惊喜发现'],
      ['最后', '第四步', '终极秘诀', '完美收尾', '锦上添花']
    ];
    
    return titles[Math.min(index - 1, titles.length - 1)][Math.floor(Math.random() * 5)];
  }

  /**
   * 获取随机主要观点
   */
  private getRandomMainPoint(keyword: string, category: string, index: number) {
    // 根据索引生成不同的主要观点
    const points = [
      `在开始${keyword}${category}之前，我们需要了解一些基本知识。${this.getRandomDetailedPoint(keyword, category, 1)}这样才能为后面的步骤打好基础。`,
      `${keyword}${category}的核心在于${this.getRandomDetailedPoint(keyword, category, 2)}很多人往往忽略了这一点，导致效果不佳。`,
      `掌握了基础后，我们可以尝试一些进阶技巧。${this.getRandomDetailedPoint(keyword, category, 3)}这些小技巧往往能起到意想不到的效果。`,
      `最后，分享一个我的独家秘诀：${this.getRandomDetailedPoint(keyword, category, 4)}这是我经过无数次尝试总结出来的，效果真的很惊人！`
    ];
    
    return points[Math.min(index - 1, points.length - 1)];
  }

  /**
   * 获取随机详细观点
   */
  private getRandomDetailedPoint(keyword: string, category: string, index: number) {
    // 根据关键词、类目和索引生成不同的详细观点
    const details = [
      `首先要选择适合自己的${keyword}产品，不要盲目跟风。我推荐选择含有${this.getRandomIngredient()}的产品，效果会更好。`,
      `正确的使用方法非常重要，建议${this.getRandomFrequency()}使用，每次使用前先${this.getRandomPreparation()}，这样效果会更好。`,
      `在${keyword}${category}过程中，一定要注意${this.getRandomAttention()}，这是很多人容易忽略的细节，但却能决定最终效果。`,
      `如果遇到${this.getRandomProblemDetail(keyword)}，不要着急，可以尝试${this.getRandomSolutionDetail()}，通常能很快解决问题。`
    ];
    
    return details[Math.min(index - 1, details.length - 1)];
  }

  /**
   * 获取随机成分
   */
  private getRandomIngredient() {
    const ingredients = ['维生素C', '玻尿酸', '烟酰胺', '水杨酸', '视黄醇', '神经酰胺', '果酸', '氨基酸', '胶原蛋白', '积雪草'];
    return ingredients[Math.floor(Math.random() * ingredients.length)];
  }

  /**
   * 获取随机频率
   */
  private getRandomFrequency() {
    const frequencies = ['每天早晚各一次', '每周2-3次', '每天使用一次', '隔天使用一次', '每周使用一次', '每天使用2-3次', '根据肌肤状态灵活使用', '连续使用一周后间隔使用', '早上使用', '晚上使用'];
    return frequencies[Math.floor(Math.random() * frequencies.length)];
  }

  /**
   * 获取随机准备
   */
  private getRandomPreparation() {
    const preparations = ['清洁面部', '用温水洗脸', '做好基础保湿', '使用爽肤水', '轻拍面部提升吸收力', '按摩促进血液循环', '使用导入仪', '敷一片面膜', '用化妆棉湿敷', '做好防晒'];
    return preparations[Math.floor(Math.random() * preparations.length)];
  }

  /**
   * 获取随机注意事项
   */
  private getRandomAttention() {
    const attentions = ['使用顺序', '产品相克性', '适量使用', '按摩手法', '使用时机', '保存方法', '产品新鲜度', '肌肤反应', '季节变化调整', '个人体质差异'];
    return attentions[Math.floor(Math.random() * attentions.length)];
  }

  /**
   * 获取随机问题细节
   */
  private getRandomProblemDetail(keyword: string) {
    const problems = ['使用后刺痛', '出现红疹', '效果不明显', '使用感不佳', '起泡沫', '搓泥', '过敏反应', '干燥紧绷', '油腻感', '不吸收'];
    return `${keyword}${problems[Math.floor(Math.random() * problems.length)]}`;
  }

  /**
   * 获取随机解决方案细节
   */
  private getRandomSolutionDetail() {
    const solutions = ['减少使用频率', '与其他产品间隔使用', '更换使用方法', '调整使用量', '添加辅助产品', '更换使用时间', '结合其他技巧', '咨询专业人士', '查看成分是否相克', '测试是否过敏'];
    return solutions[Math.floor(Math.random() * solutions.length)];
  }

  /**
   * 获取随机结论
   */
  private getRandomConclusion(keyword: string, category: string) {
    const conclusions = [
      `以上就是我关于${keyword}${category}的全部分享，希望能对你有所帮助！记住，坚持才是最重要的，效果不是一蹴而就的，需要一定的时间和耐心。`,
      `总的来说，${keyword}${category}并不复杂，掌握了正确的方法，坚持下去，一定会看到明显的效果。希望我的分享能给你带来一些启发！`,
      `${keyword}${category}的道路上，每个人都可能遇到不同的问题，但只要方法正确，总能找到适合自己的解决方案。希望我的经验能为你提供一些参考！`,
      `最后想说，${keyword}${category}没有绝对的标准答案，最重要的是找到适合自己的方法。希望通过我的分享，你能少走一些弯路，更快地看到效果！`,
      `感谢你看到这里！${keyword}${category}是一个需要不断学习和尝试的过程，希望我的分享能成为你旅程中的一盏明灯。如果有任何问题，欢迎在评论区交流！`
    ];
    
    return conclusions[Math.floor(Math.random() * conclusions.length)];
  }
}
