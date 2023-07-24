import { CapRover } from '../src/caprover';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('CapRover', () => {
  const url = 'localhost:3000';
  const password = 'password';
  const appName = 'testApp';
  const imageTag = 'testTag';
  
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('createApp', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const capRover = new CapRover(url, password);
    await capRover.createApp(appName);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`http://${url}/app/register/${appName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  });

  test('deployApp', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const capRover = new CapRover(url, password);
    await capRover.deployApp(appName, imageTag);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`http://${url}/app/deploy/${appName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        imageTag,
      }),
    });
  });

  test('deleteApp', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const capRover = new CapRover(url, password);
    await capRover.deleteApp(appName);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`http://${url}/app/delete/${appName}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  });
});
