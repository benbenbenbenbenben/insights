using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SDSAM;

namespace ConsoleApplication1
{
    class Program
    {
        static void Main(string[] args)
        {
            var c = new ADSearcher();
            
            /*var groups = c.ListGroups();
            foreach (var group in groups)
            {
                Console.WriteLine("{0}", group);
            }*/

            /*var users = c.ListUsers();
            foreach (var user in users)
            {
                Console.WriteLine("{0}", user);
            }*/





            var users = c.FindUser("BABIKBE1");
            foreach (var user in users)
            {
                Console.WriteLine("{0}", user);
                foreach (var gro in user.Groups)
                {
                    Console.WriteLine("\t{0}", gro.Name);
                }
            }

            Console.ReadKey();
        }
    }
}
