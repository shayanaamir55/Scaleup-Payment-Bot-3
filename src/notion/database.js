import { notion } from './client.js';
import { NOTION_DATABASE_ID, NOTION_PENDING_DATABASE_ID, DEFAULT_BALANCE } from '../config/index.js';

export async function getUser(discordId) {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: 'DiscordID',
        title: {
          equals: discordId
        }
      }
    });

    return response.results[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function createUser(discordId, accountNumber, name = '', bankName = '') {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_DATABASE_ID,
      },
      properties: {
        DiscordID: {
          title: [
            {
              text: {
                content: discordId
              }
            }
          ]
        },
        Account: {
          rich_text: [
            {
              text: {
                content: accountNumber
              }
            }
          ]
        },
        Balance: {
          number: DEFAULT_BALANCE
        },
        Name: {
          rich_text: [
            {
              text: {
                content: name
              }
            }
          ]
        },
        Bank: {
          rich_text: [
            {
              text: {
                content: bankName
              }
            }
          ]
        },
        LastUpdated: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateBalance(pageId, newBalance) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Balance: {
          number: newBalance
        },
        LastUpdated: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
}

export async function updateAccountNumber(pageId, accountNumber, bankName) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Account: {
          rich_text: [
            {
              text: {
                content: accountNumber
              }
            }
          ]
        },
        Bank: {
          rich_text: [
            {
              text: {
                content: bankName
              }
            }
          ]
        },
        LastUpdated: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error updating account number:', error);
    throw error;
  }
}

export function extractUserData(page) {
  const properties = page.properties;
  
  return {
    id: page.id,
    discordId: properties.DiscordID?.title[0]?.text?.content || '',
    account: properties.Account?.rich_text[0]?.text?.content || '',
    balance: properties.Balance?.number || 0,
    name: properties.Name?.rich_text[0]?.text?.content || '',
    bank: properties.Bank?.rich_text[0]?.text?.content || '',
    lastUpdated: properties.LastUpdated?.date?.start || null
  };
}

// Pending withdrawal request functions
export async function createPendingWithdrawal(discordId, amount, account, bank, username) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_PENDING_DATABASE_ID,
      },
      properties: {
        DiscordID: {
          title: [
            {
              text: {
                content: discordId
              }
            }
          ]
        },
        Amount: {
          number: amount
        },
        Account: {
          rich_text: [
            {
              text: {
                content: account
              }
            }
          ]
        },
        Bank: {
          rich_text: [
            {
              text: {
                content: bank
              }
            }
          ]
        },
        Username: {
          rich_text: [
            {
              text: {
                content: username
              }
            }
          ]
        },
        Status: {
          rich_text: [
            {
              text: {
                content: 'Pending'
              }
            }
          ]
        },
        RequestedAt: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error creating pending withdrawal:', error);
    throw error;
  }
}

export async function getPendingWithdrawal(requestId) {
  try {
    const response = await notion.pages.retrieve({
      page_id: requestId
    });

    return response;
  } catch (error) {
    console.error('Error fetching pending withdrawal:', error);
    throw error;
  }
}

export async function updateWithdrawalStatus(requestId, status, processedBy = '') {
  try {
    const response = await notion.pages.update({
      page_id: requestId,
      properties: {
        Status: {
          rich_text: [
            {
              text: {
                content: status
              }
            }
          ]
        },
        ProcessedAt: {
          date: {
            start: new Date().toISOString()
          }
        },
        ProcessedBy: {
          rich_text: [
            {
              text: {
                content: processedBy
              }
            }
          ]
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    throw error;
  }
}

export async function getAllPendingWithdrawals() {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_PENDING_DATABASE_ID,
      filter: {
        property: 'Status',
        rich_text: {
          equals: 'Pending'
        }
      },
      sorts: [
        {
          property: 'RequestedAt',
          direction: 'descending'
        }
      ]
    });

    return response.results;
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    throw error;
  }
}

export function extractPendingWithdrawalData(page) {
  const properties = page.properties;
  
  return {
    id: page.id,
    discordId: properties.DiscordID?.title[0]?.text?.content || '',
    amount: properties.Amount?.number || 0,
    account: properties.Account?.rich_text[0]?.text?.content || '',
    bank: properties.Bank?.rich_text[0]?.text?.content || '',
    username: properties.Username?.rich_text[0]?.text?.content || '',
    status: properties.Status?.rich_text[0]?.text?.content || 'Pending',
    requestedAt: properties.RequestedAt?.date?.start || null,
    processedAt: properties.ProcessedAt?.date?.start || null,
    processedBy: properties.ProcessedBy?.rich_text[0]?.text?.content || ''
  };
}
