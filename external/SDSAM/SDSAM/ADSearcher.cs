using System;
using System.Collections.Generic;
using System.DirectoryServices.AccountManagement;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SDSAM
{
    public class ADSearcher
    {

        public IEnumerable<string> ListGroups()
        {
            var pc = new PrincipalContext(ContextType.Domain);
            var gp = new GroupPrincipal(pc);
            var ps = new PrincipalSearcher(gp);

            foreach (var grp in ps.FindAll())
            {
                yield return grp.DistinguishedName;
            }
        }

        public IEnumerable<string> ListUsers()
        {
            var pc = new PrincipalContext(ContextType.Domain);
            var gp = new UserPrincipal(pc);
            var ps = new PrincipalSearcher(gp);

            foreach (var grp in ps.FindAll())
            {
                yield return grp.DistinguishedName;
            }
        }

        public IEnumerable<User> FindUser(string username)
        {
            var pc = new PrincipalContext(ContextType.Domain);
            var gp = new UserPrincipal(pc);
            var ps = new PrincipalSearcher(gp);

            ps.QueryFilter.Name = username;

            foreach (var u in ps.FindAll().Select(u => new User
                {
                    DistinguishedName = u.DistinguishedName,
                    Name = u.Name
                }))
            {
                u.Groups = FindGroup(u).ToList();
                yield return u;
            }
        }

        public IEnumerable<Group> FindGroup(User user)
        {
            var u = UserPrincipal.FindByIdentity(new PrincipalContext(ContextType.Domain), IdentityType.DistinguishedName, user.DistinguishedName);
            foreach (var grp in u.GetGroups())
            {
                yield return new Group
                {
                    DistinguishedName = grp.DistinguishedName,
                    Name = grp.Name
                };
            }
        }
    }
}
