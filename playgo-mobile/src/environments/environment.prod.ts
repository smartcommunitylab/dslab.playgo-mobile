export const environment = {
  production: true,
  auth_config: {
    server_host: 'https://aac.platform.smartcommunitylab.it',
    client_id: 'c_5445634c-95d6-4c0e-a1ff-829b951b91b3',
    redirect_url: 'it.dslab.playgo://callback',
    end_session_redirect_url: 'it.dslab.playgo://endsession',
    scopes: 'openid email profile',
    pkce: true,
  },
};
